import { useState } from "react";

type RGB = {
  r: number;
  g: number;
  b: number;
};

type ColorDetail = {
  label: string;
  value: string;
  swatch?: string;
};

function parseRgb(hex: string): RGB | null {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return null;

  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

export default function PixelColorDetails({
  hex,
}: {
  hex: string | null;
}) {
  const [open, setOpen] = useState(false);
  const rgb = hex ? parseRgb(hex) : null;

  const entries: ColorDetail[] = [
    {
      label: "RGB",
      value: rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : "—",
    },
  ];

  return (
    <div className="pointer-events-auto relative">
      <button
        type="button"
        disabled={!rgb}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="rounded border border-white/20 px-2 py-1 text-[10px] hover:bg-white/10 disabled:opacity-40"
      >
        Color Details
      </button>

      {open && rgb && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-56 rounded-lg border border-white/15 bg-[#191a1f] p-3 text-white shadow-xl">
          <p className="mb-3 text-xs font-semibold">
            Pixel Color Details
          </p>

          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.label}
                className="flex items-center justify-between gap-3 text-[11px]"
              >
                <span className="text-white/60">
                  {entry.label}
                </span>
                <span className="flex items-center gap-2 font-mono">
                  {entry.swatch && (
                    <span
                      className="inline-block h-4 w-4 rounded-sm border border-white/20"
                      style={{ backgroundColor: entry.swatch }}
                    />
                  )}
                  {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
