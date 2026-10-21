import PixelColorDetails from "./PixelColorDetails";
import { useEffect, useState } from "react";
import type { PencilGrade } from "../brushes/pencil";

type Position = {
  x: number;
  y: number;
  hex: string;
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
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  async function copyPixelColor() {
    if (!position) return;

    try {
      await navigator.clipboard.writeText(position.hex);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

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

      const pixelX = Math.min(
        canvas.width - 1,
        Math.floor(x * canvas.width)
      );
      const pixelY = Math.min(
        canvas.height - 1,
        Math.floor(y * canvas.height)
      );

      const data = canvas
        .getContext("2d")
        ?.getImageData(pixelX, pixelY, 1, 1).data;

      const alpha = data ? data[3] / 255 : 0;

      const background = [243, 240, 232];

      const hex = `#${background
        .map((value, index) => {
          const channel = data
            ? Math.round(data[index] * alpha + value * (1 - alpha))
            : value;

          return channel.toString(16).padStart(2, "0");
        })
        .join("")
        .toUpperCase()}`;

      setPosition({
        x: pixelX,
        y: pixelY,
        hex,
      });
      setCopied(false);
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
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        className="pointer-events-auto rounded border border-white/20 px-2 py-1 text-[10px] hover:bg-white/10"
      >
        {expanded ? "Hide" : "Show"}
      </button>
      {expanded && (
        <div className="flex items-center gap-3">
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
      <PixelColorDetails hex={position?.hex ?? null} />
      <span className="flex items-center gap-2 border-l border-white/20 pl-3">
        <span
          className="h-3 w-3 rounded-sm border border-white/30"
          style={{
            backgroundColor: position?.hex ?? "#f3f0e8",
          }}
        />
        {position?.hex ?? "—"}
      </span>
      <button
        type="button"
        disabled={!position}
        onClick={copyPixelColor}
        className="pointer-events-auto rounded border border-white/20 px-2 py-1 text-[10px] hover:bg-white/10 disabled:opacity-40"
      >
        {copied ? "Copied" : "Copy HEX"}
      </button>
        </div>
      )}
    </div>
  );
}
