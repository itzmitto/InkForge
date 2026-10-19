import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  drawPencilDot,
  drawPencilStroke,
} from "./brushes/pencil";
import type {
  PencilGrade,
  PencilPoint,
} from "./brushes/pencil";

type DrawingTool = "pencil" | "ink" | "eraser" | "none";

type CanvasSurfaceProps = {
  tool: DrawingTool;
  brushSize: number;
  pencilGrade: PencilGrade;
};

const WIDTH = 1920;
const HEIGHT = 1440;

export default function CanvasSurface({
  tool,
  brushSize,
  pencilGrade,
}: CanvasSurfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPoint = useRef<PencilPoint | null>(null);
  const activePointerId = useRef<number | null>(null);

  function getPoint(
    event: ReactPointerEvent<HTMLCanvasElement>
  ): PencilPoint {
    const rect = event.currentTarget.getBoundingClientRect();

    return {
      x: Math.max(
        0,
        Math.min(
          WIDTH,
          ((event.clientX - rect.left) * WIDTH) / rect.width
        )
      ),
      y: Math.max(
        0,
        Math.min(
          HEIGHT,
          ((event.clientY - rect.top) * HEIGHT) / rect.height
        )
      ),
      pressure:
        event.pointerType === "pen"
          ? Math.max(0.1, Math.min(1, event.pressure))
          : 0.75,
    };
  }

  function getContext() {
    return canvasRef.current?.getContext("2d") ?? null;
  }

  function drawInkDot(
    context: CanvasRenderingContext2D,
    point: PencilPoint
  ) {
    context.fillStyle = "#292620";
    context.beginPath();
    context.arc(point.x, point.y, brushSize / 2, 0, Math.PI * 2);
    context.fill();
  }

  function drawInkLine(
    context: CanvasRenderingContext2D,
    from: PencilPoint,
    to: PencilPoint
  ) {
    context.strokeStyle = "#292620";
    context.lineWidth = brushSize;
    context.lineCap = "round";
    context.lineJoin = "round";

    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
  }

  function eraseDot(
    context: CanvasRenderingContext2D,
    point: PencilPoint
  ) {
    context.save();
    context.globalCompositeOperation = "destination-out";
    context.globalAlpha = 1;
    context.fillStyle = "#000000";
    context.beginPath();
    context.arc(
      point.x,
      point.y,
      Math.max(0.5, brushSize / 2),
      0,
      Math.PI * 2
    );
    context.fill();
    context.restore();
  }

  function eraseLine(
    context: CanvasRenderingContext2D,
    from: PencilPoint,
    to: PencilPoint
  ) {
    context.save();
    context.globalCompositeOperation = "destination-out";
    context.globalAlpha = 1;
    context.strokeStyle = "#000000";
    context.lineWidth = brushSize;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
    context.restore();
  }

  function handlePointerDown(
    event: ReactPointerEvent<HTMLCanvasElement>
  ) {
    if (tool === "none" || event.button !== 0) return;
    if (activePointerId.current !== null) return;

    const context = getContext();
    if (!context) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    activePointerId.current = event.pointerId;

    const point = getPoint(event);
    lastPoint.current = point;

    if (tool === "pencil") {
      drawPencilDot(context, point, brushSize, pencilGrade);
    } else if (tool === "eraser") {
      eraseDot(context, point);
    } else {
      drawInkDot(context, point);
    }
  }

  function handlePointerMove(
    event: ReactPointerEvent<HTMLCanvasElement>
  ) {
    if (activePointerId.current !== event.pointerId) return;
    if (!lastPoint.current || tool === "none") return;

    const context = getContext();
    if (!context) return;

    const point = getPoint(event);

    if (tool === "pencil") {
      drawPencilStroke(
        context,
        lastPoint.current,
        point,
        brushSize,
        pencilGrade
      );
    } else if (tool === "eraser") {
      eraseLine(context, lastPoint.current, point);
    } else {
      drawInkLine(context, lastPoint.current, point);
    }

    lastPoint.current = point;
  }

  function handlePointerUp(
    event: ReactPointerEvent<HTMLCanvasElement>
  ) {
    if (activePointerId.current !== event.pointerId) return;

    activePointerId.current = null;
    lastPoint.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
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
      onPointerCancel={handlePointerUp}
    />
  );
}
