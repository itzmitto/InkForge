export type PencilGrade = "HB" | "2B" | "4B" | "6B";

export type PencilPoint = {
  x: number;
  y: number;
  pressure: number;
};

export const PENCIL_GRADES: PencilGrade[] = [
  "HB",
  "2B",
  "4B",
  "6B",
];

const presets: Record<
  PencilGrade,
  { opacity: number; width: number; grain: number }
> = {
  HB: { opacity: 0.15, width: 0.85, grain: 2 },
  "2B": { opacity: 0.20, width: 1, grain: 3 },
  "4B": { opacity: 0.26, width: 1.15, grain: 4 },
  "6B": { opacity: 0.33, width: 1.3, grain: 5 },
};

function stamp(
  context: CanvasRenderingContext2D,
  point: PencilPoint,
  size: number,
  grade: PencilGrade,
  random: () => number
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
    preset.opacity * (0.4 + pressure * 0.6);

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
      preset.opacity * (0.15 + random() * 0.4);

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
  random: () => number = Math.random
) {
  stamp(context, point, size, grade, random);
}

export function drawPencilStroke(
  context: CanvasRenderingContext2D,
  from: PencilPoint,
  to: PencilPoint,
  size: number,
  grade: PencilGrade,
  random: () => number = Math.random
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
      random
    );
  }
}
