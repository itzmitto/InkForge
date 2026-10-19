import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

type CanvasSurfaceProps = {
  enabled: boolean;
  brushSize: number;
};

type Point = {
  x: number;
  y: number;
};

const WIDTH = 1920;
const HEIGHT = 1440;

export default function CanvasSurface({
  enabled,
  brushSize,
}: CanvasSurfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPoint = useRef<Point | null>(null);

  function getPoint(event: ReactPointerEvent<HTMLCanvasElement>): Point {
    const rect = event.currentTarget.getBoundingClientRect();

    return {
      x: Math.max(0, Math.min(WIDTH, (event.clientX - rect.left) * WIDTH / rect.width)),
      y: Math.max(0, Math.min(HEIGHT, (event.clientY - rect.top) * HEIGHT / rect.height)),
    };
  }

  function getContext() {
    const context = canvasRef.current?.getContext("2d");

    if (!context) return null;

    context.strokeStyle = "#292620";
    context.fillStyle = "#292620";
    context.lineWidth = brushSize;
    context.lineCap = "round";
    context.lineJoin = "round";

    return context;
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!enabled || event.button !== 0) return;

    const context = getContext();
    if (!context) return;

    event.currentTarget.setPointerCapture(event.pointerId);

    const point = getPoint(event);
    lastPoint.current = point;

    context.beginPath();
    context.arc(point.x, point.y, brushSize / 2, 0, Math.PI * 2);
    context.fill();
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!enabled || !lastPoint.current) return;

    const context = getContext();
    if (!context) return;

    const point = getPoint(event);

    context.beginPath();
    context.moveTo(lastPoint.current.x, lastPoint.current.y);
    context.lineTo(point.x, point.y);
    context.stroke();

    lastPoint.current = point;
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLCanvasElement>) {
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
        enabled ? "cursor-crosshair" : "cursor-default"
      }`}
      style={{ touchAction: "none" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  );
}
