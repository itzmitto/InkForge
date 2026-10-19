import { forwardRef, useImperativeHandle, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  drawPencilDot,
  drawPencilStroke,
} from "./brushes/pencil";
import type {
  PencilGrade,
  PencilPoint,
} from "./brushes/pencil";

type DrawingTool = "pencil" | "ink" | "eraser";
type SelectedTool = DrawingTool | "none";

type Stroke = {
  tool: DrawingTool;
  size: number;
  grade: PencilGrade;
  seed: number;
  points: PencilPoint[];
};

type HistoryState = {
  canUndo: boolean;
  canRedo: boolean;
};

type CanvasSurfaceProps = {
  tool: SelectedTool;
  brushSize: number;
  pencilGrade: PencilGrade;
  onHistoryChange?: (state: HistoryState) => void;
};

export type CanvasSurfaceHandle = {
  undo: () => void;
  redo: () => void;
};

const WIDTH = 1920;
const HEIGHT = 1440;

function createRandom(seed: number) {
  let state = seed || 1;

  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

function drawDot(
  context: CanvasRenderingContext2D,
  stroke: Stroke,
  point: PencilPoint,
  random: () => number
) {
  if (stroke.tool === "pencil") {
    drawPencilDot(
      context,
      point,
      stroke.size,
      stroke.grade,
      random
    );
    return;
  }

  context.save();

  if (stroke.tool === "eraser") {
    context.globalCompositeOperation = "destination-out";
  }

  context.fillStyle = "#292620";
  context.beginPath();
  context.arc(point.x, point.y, stroke.size / 2, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawSegment(
  context: CanvasRenderingContext2D,
  stroke: Stroke,
  from: PencilPoint,
  to: PencilPoint,
  random: () => number
) {
  if (stroke.tool === "pencil") {
    drawPencilStroke(
      context,
      from,
      to,
      stroke.size,
      stroke.grade,
      random
    );
    return;
  }

  context.save();

  if (stroke.tool === "eraser") {
    context.globalCompositeOperation = "destination-out";
  }

  context.strokeStyle = "#292620";
  context.lineWidth = stroke.size;
  context.lineCap = "round";
  context.lineJoin = "round";

  context.beginPath();
  context.moveTo(from.x, from.y);
  context.lineTo(to.x, to.y);
  context.stroke();

  context.restore();
}

const CanvasSurface = forwardRef<
  CanvasSurfaceHandle,
  CanvasSurfaceProps
>(function CanvasSurface(
  { tool, brushSize, pencilGrade, onHistoryChange },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const redoStack = useRef<Stroke[]>([]);
  const activeStroke = useRef<Stroke | null>(null);
  const activePointer = useRef<number | null>(null);
  const activeRandom = useRef<(() => number) | null>(null);
  const sequence = useRef(0);

  function getContext() {
    return canvasRef.current?.getContext("2d") ?? null;
  }

  function getPoint(
    event: ReactPointerEvent<HTMLCanvasElement>
  ): PencilPoint {
    const rect = event.currentTarget.getBoundingClientRect();

    return {
      x: Math.max(
        0,
        Math.min(
          WIDTH,
          ((event.clientX - rect.left) / rect.width) * WIDTH
        )
      ),
      y: Math.max(
        0,
        Math.min(
          HEIGHT,
          ((event.clientY - rect.top) / rect.height) * HEIGHT
        )
      ),
      pressure:
        event.pointerType === "pen"
          ? Math.max(0.1, Math.min(1, event.pressure))
          : 0.75,
    };
  }

  function updateHistory() {
    onHistoryChange?.({
      canUndo: strokes.current.length > 0,
      canRedo: redoStack.current.length > 0,
    });
  }

  function redraw() {
    const context = getContext();
    if (!context) return;

    context.clearRect(0, 0, WIDTH, HEIGHT);

    for (const stroke of strokes.current) {
      if (stroke.points.length === 0) continue;

      const random = createRandom(stroke.seed);

      drawDot(context, stroke, stroke.points[0], random);

      for (let i = 1; i < stroke.points.length; i++) {
        drawSegment(
          context,
          stroke,
          stroke.points[i - 1],
          stroke.points[i],
          random
        );
      }
    }
  }

  useImperativeHandle(ref, () => ({
    undo() {
      if (activeStroke.current) return;

      const stroke = strokes.current.pop();
      if (!stroke) return;

      redoStack.current.push(stroke);
      redraw();
      updateHistory();
    },

    redo() {
      if (activeStroke.current) return;

      const stroke = redoStack.current.pop();
      if (!stroke) return;

      strokes.current.push(stroke);
      redraw();
      updateHistory();
    },
  }));

  function handlePointerDown(
    event: ReactPointerEvent<HTMLCanvasElement>
  ) {
    if (tool === "none" || event.button !== 0) return;
    if (activePointer.current !== null) return;

    const context = getContext();
    if (!context) return;

    const point = getPoint(event);
    const seed = (++sequence.current * 2654435761) >>> 0;

    const stroke: Stroke = {
      tool,
      size: brushSize,
      grade: pencilGrade,
      seed,
      points: [point],
    };

    activeStroke.current = stroke;
    activePointer.current = event.pointerId;
    activeRandom.current = createRandom(seed);

    event.currentTarget.setPointerCapture(event.pointerId);

    drawDot(context, stroke, point, activeRandom.current);
  }

  function handlePointerMove(
    event: ReactPointerEvent<HTMLCanvasElement>
  ) {
    if (activePointer.current !== event.pointerId) return;

    const stroke = activeStroke.current;
    const context = getContext();
    const random = activeRandom.current;

    if (!stroke || !context || !random) return;

    const point = getPoint(event);
    const previous = stroke.points[stroke.points.length - 1];

    if (
      previous.x === point.x &&
      previous.y === point.y &&
      previous.pressure === point.pressure
    ) {
      return;
    }

    stroke.points.push(point);

    drawSegment(context, stroke, previous, point, random);
  }

  function releasePointer(
    event: ReactPointerEvent<HTMLCanvasElement>
  ) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    activeStroke.current = null;
    activePointer.current = null;
    activeRandom.current = null;
  }

  function handlePointerUp(
    event: ReactPointerEvent<HTMLCanvasElement>
  ) {
    if (activePointer.current !== event.pointerId) return;

    handlePointerMove(event);

    const stroke = activeStroke.current;

    if (stroke) {
      strokes.current.push(stroke);
      redoStack.current = [];
    }

    releasePointer(event);
    updateHistory();
  }

  function handlePointerCancel(
    event: ReactPointerEvent<HTMLCanvasElement>
  ) {
    if (activePointer.current !== event.pointerId) return;

    releasePointer(event);
    redraw();
    updateHistory();
  }

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      aria-label="InkForge drawing canvas"
      className={`absolute inset-0 h-full w-full ${
        tool === "none" ? "cursor-default" : "cursor-crosshair"
      }`}
      style={{ touchAction: "none" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    />
  );
});

export default CanvasSurface;
