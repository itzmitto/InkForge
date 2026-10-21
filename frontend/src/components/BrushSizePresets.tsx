const SIZES = [1, 2, 4, 8, 16, 32, 64] as const;

type BrushSizePresetsProps = {
  value: number;
  onChange: (size: number) => void;
};

export default function BrushSizePresets({
  value,
  onChange,
}: BrushSizePresetsProps) {
  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-[#9b9ba0]">
          Quick Sizes
        </span>
        <span className="text-xs text-[#cba879]">
          {value}px
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {SIZES.map((size) => (
          <button
            key={size}
            type="button"
            aria-label={`Set brush size to ${size} pixels`}
            aria-pressed={value === size}
            onClick={() => onChange(size)}
            className={`rounded-md border px-2 py-2 text-xs transition-colors ${
              value === size
                ? "border-[#cba879] bg-[#cba879]/15 text-[#cba879]"
                : "border-white/10 bg-white/5 text-[#aaaab0] hover:bg-white/10"
            }`}
          >
            {size}px
          </button>
        ))}
      </div>
    </div>
  );
}
