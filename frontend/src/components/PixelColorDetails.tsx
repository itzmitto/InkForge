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

function getHsl(rgb: RGB): string {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let hue = 0;
  let saturation = 0;
  const lightness = (max + min) / 2;

  if (delta > 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));

    switch (max) {
      case r:
        hue = ((g - b) / delta) % 6;
        break;
      case g:
        hue = (b - r) / delta + 2;
        break;
      default:
        hue = (r - g) / delta + 4;
    }

    hue = (hue * 60 + 360) % 360;
  }

  return `${Math.round(hue)}°, ${Math.round(saturation * 100)}%, ${Math.round(lightness * 100)}%`;
}

function getCmyk(rgb: RGB): string {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const k = 1 - Math.max(r, g, b);

  if (k === 1) {
    return "0%, 0%, 0%, 100%";
  }

  const c = Math.round(((1 - r - k) / (1 - k)) * 100);
  const m = Math.round(((1 - g - k) / (1 - k)) * 100);
  const y = Math.round(((1 - b - k) / (1 - k)) * 100);

  return `${c}%, ${m}%, ${y}%, ${Math.round(k * 100)}%`;
}

function getLuminance(rgb: RGB): string {
  const channels = [rgb.r, rgb.g, rgb.b].map((value) => {
    const channel = value / 255;

    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });

  const luminance =
    channels[0] * 0.2126 +
    channels[1] * 0.7152 +
    channels[2] * 0.0722;

  return `${Math.round(luminance * 100)}%`;
}

function getInvertedHex(rgb: RGB): string {
  return (
    "#" +
    [255 - rgb.r, 255 - rgb.g, 255 - rgb.b]
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
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
    {
      label: "HSL",
      value: rgb ? getHsl(rgb) : "—",
    },
    {
      label: "CMYK",
      value: rgb ? getCmyk(rgb) : "—",
    },
    {
      label: "Luminance",
      value: rgb ? getLuminance(rgb) : "—",
    },
    {
      label: "Inverted",
      value: rgb ? getInvertedHex(rgb) : "—",
      swatch: rgb ? getInvertedHex(rgb) : undefined,
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
