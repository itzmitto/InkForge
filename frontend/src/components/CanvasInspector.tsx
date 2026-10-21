import { useEffect, useState } from "react";
import type { PencilGrade } from "../brushes/pencil";

type Position = {
  x: number;
  y: number;
};

type CanvasInspectorProps = {
  zoom: number;
  tool: "select" | "pencil" | "ink" | "eraser" | "hand";
  brushSize: number;
  pencilGrade: PencilGrade;
};

export default function CanvasInspector({
  zoom,
  tool,
  brushSize,
  pencilGrade,
}: CanvasInspectorProps) {
  const [position, setPosition] = useState<Position | null>(null);

  useEffect(() => {
    const canvas = document.querySelector<HTMLCanvasElement>(
      'canvas[aria-label="InkForge drawing canvas"]'
    );

    if (!canvas) return;

    function handleMove(event: PointerEvent) {
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();

      if (rect.width <= 0 || rect.height <= 0) return;

      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      if (x < 0 || x > 1 || y < 0 || y > 1) {
        setPosition(null);
        return;
      }

      setPosition({
        x: Math.min(canvas.width - 1, Math.floor(x * canvas.width)),
        y: Math.min(canvas.height - 1, Math.floor(y * canvas.height)),
      });
    }

    function handleLeave() {
      setPosition(null);
    }

    canvas.addEventListener("pointermove", handleMove);
    canvas.addEventListener("pointerleave", handleLeave);
    canvas.addEventListener("pointercancel", handleLeave);

    return () => {
      canvas.removeEventListener("pointermove", handleMove);
      canvas.removeEventListener("pointerleave", handleLeave);
      canvas.removeEventListener("pointercancel", handleLeave);
    };
  }, []);

  return (
    <div
      aria-label="Canvas inspector"
      className="pointer-events-none absolute bottom-4 left-4 z-30 flex items-center gap-3 rounded-lg border border-white/10 bg-[#191a1f]/90 px-3 py-2 font-mono text-[11px] text-white shadow-lg"
    >
      <span>
        X: {position?.x ?? "—"}
      </span>
      <span>
        Y: {position?.y ?? "—"}
      </span>
      <span className="border-l border-white/20 pl-3">
        Zoom: {zoom}%
      </span>
      <span className="border-l border-white/20 pl-3">
        {tool === "pencil" ? `Pencil ${pencilGrade}` : tool}
      </span>
      <span>{brushSize}px</span>
    </div>
  );
}
