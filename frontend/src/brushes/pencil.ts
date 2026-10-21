export type PencilGrade =
  | "9H"
  | "8H"
  | "7H"
  | "6H"
  | "5H"
  | "4H"
  | "3H"
  | "2H"
  | "H"
  | "F"
  | "HB"
  | "B"
  | "2B"
  | "3B"
  | "4B"
  | "5B"
  | "6B"
  | "7B"
  | "8B"
  | "9B";

export type PencilPoint = {
  x: number;
  y: number;
  pressure: number;
};

export const PENCIL_GRADES: PencilGrade[] = [
  "9H",
  "8H",
  "7H",
  "6H",
  "5H",
  "4H",
  "3H",
  "2H",
  "H",
  "F",
  "HB",
  "B",
  "2B",
  "3B",
  "4B",
  "5B",
  "6B",
  "7B",
  "8B",
  "9B",
];

const presets: Record<
  PencilGrade,
  { opacity: number; width: number; grain: number }
> = {
  "9H": { opacity: 0.045, width: 0.55, grain: 1 },
  "8H": { opacity: 0.055, width: 0.58, grain: 1 },
  "7H": { opacity: 0.065, width: 0.61, grain: 1 },
  "6H": { opacity: 0.075, width: 0.64, grain: 1 },
  "5H": { opacity: 0.085, width: 0.67, grain: 1 },
  "4H": { opacity: 0.095, width: 0.70, grain: 1 },
  "3H": { opacity: 0.105, width: 0.74, grain: 2 },
  "2H": { opacity: 0.115, width: 0.77, grain: 2 },
  "H": { opacity: 0.130, width: 0.82, grain: 2 },
  "F": { opacity: 0.140, width: 0.84, grain: 2 },
  "HB": { opacity: 0.150, width: 0.85, grain: 2 },
  "B": { opacity: 0.175, width: 0.93, grain: 3 },
  "2B": { opacity: 0.200, width: 1.00, grain: 3 },
  "3B": { opacity: 0.230, width: 1.08, grain: 4 },
  "4B": { opacity: 0.260, width: 1.15, grain: 4 },
  "5B": { opacity: 0.295, width: 1.23, grain: 5 },
  "6B": { opacity: 0.330, width: 1.30, grain: 5 },
  "7B": { opacity: 0.360, width: 1.36, grain: 5 },
  "8B": { opacity: 0.390, width: 1.42, grain: 6 },
  "9B": { opacity: 0.420, width: 1.48, grain: 6 },
};

function stamp(
  context: CanvasRenderingContext2D,
  point: PencilPoint,
  size: number,
  grade: PencilGrade,
  random: () => number,
  opacity: number
) {
  const preset = presets[grade];
  const pressure = Math.max(0.1, Math.min(1, point.pressure));
  const radius = Math.max(
    0.5,
    size * preset.width * (0.25 + pressure * 0.25)
  );

  context.save();
  context.fillStyle = "#211f1c";
  context.globalAlpha =
    preset.opacity * (0.4 + pressure * 0.6) * opacity;

  context.beginPath();
  context.ellipse(
    point.x,
    point.y,
    radius,
    radius * 0.85,
    0,
    0,
    Math.PI * 2
  );
  context.fill();

  for (let i = 0; i < preset.grain; i++) {
    const angle = random() * Math.PI * 2;
    const distance = Math.sqrt(random()) * radius;
    const x = point.x + Math.cos(angle) * distance;
    const y = point.y + Math.sin(angle) * distance;

    context.globalAlpha =
      preset.opacity * (0.15 + random() * 0.4) * opacity;

    context.beginPath();
    context.arc(
      x,
      y,
      Math.max(0.2, radius * (0.05 + random() * 0.1)),
      0,
      Math.PI * 2
    );
    context.fill();
  }

  context.restore();
}

export function drawPencilDot(
  context: CanvasRenderingContext2D,
  point: PencilPoint,
  size: number,
  grade: PencilGrade,
  random: () => number = Math.random,
  opacity = 1
) {
  stamp(context, point, size, grade, random, opacity);
}

export function drawPencilStroke(
  context: CanvasRenderingContext2D,
  from: PencilPoint,
  to: PencilPoint,
  size: number,
  grade: PencilGrade,
  random: () => number = Math.random,
  opacity = 1
) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  const spacing = Math.max(0.5, Math.min(2.5, size * 0.16));
  const steps = Math.max(
    1,
    Math.min(2500, Math.ceil(distance / spacing))
  );

  for (let step = 1; step <= steps; step++) {
    const t = step / steps;

    stamp(
      context,
      {
        x: from.x + dx * t,
        y: from.y + dy * t,
        pressure:
          from.pressure + (to.pressure - from.pressure) * t,
      },
      size,
      grade,
      random,
      opacity
    );
  }
}
