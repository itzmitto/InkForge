import { useRef, useState } from "react";
type ReferenceImage = {
  id: string;
  name: string;
  file: File;
  url: string;
  addedAt: number;
  favorite: boolean;
  notes: string;
};

const MAX_IMAGES = 40;
const MAX_FILE_SIZE = 20 * 1024 * 1024;

export default function ReferenceBoard() {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<ReferenceImage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

function formatSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
  const [gridView, setGridView] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const accent = "#93c5fd";

  const selected = images.find((image) => image.id === selectedId) ?? null;

  function addFiles(files: FileList | File[]) {
    const valid = Array.from(files).filter(
      (file) => file.type.startsWith("image/") && file.size <= MAX_FILE_SIZE
    );
    if (valid.length === 0) {
      setMessage("Choose an image under 20 MB.");
      return;
    }
    const available = Math.max(0, MAX_IMAGES - images.length);
    const entries: ReferenceImage[] = valid.slice(0, available).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      file,
      url: URL.createObjectURL(file),
      addedAt: Date.now(),
      favorite: false,
      notes: "",
    }));
    if (entries.length === 0) {
      setMessage("Reference board is full (40 images).");
      return;
    }
    setImages((current) => [...current, ...entries]);
    setSelectedId(entries[entries.length - 1].id);
    setMessage(`${entries.length} reference image(s) added.`);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeSelected() {
    if (!selected) return;
    URL.revokeObjectURL(selected.url);
    const remaining = images.filter((image) => image.id !== selected.id);
    setImages(remaining);
    setSelectedId(remaining[0]?.id ?? null);
    setMessage("Reference removed.");
  }

  function clearBoard() {
    if (!images.length || !window.confirm("Remove all reference images?")) return;
    images.forEach((image) => URL.revokeObjectURL(image.url));
    setImages([]);
    setSelectedId(null);
    setMessage("Board cleared.");
  }

  const visibleImages = images;

  return (
    <div
      className="pointer-events-none fixed top-24 z-[90]"
      style={{ right: 16 }}
    >
      <div className="pointer-events-auto flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls="inkforge-reference-panel"
          className="rounded-full border border-white/15 bg-[#151c2b] px-4 py-2 text-xs font-semibold text-white shadow-2xl transition hover:brightness-125"
        >
          Reference Board {open ? "−" : "+"}
        </button>
        {open && (
          <section
            id="inkforge-reference-panel"
            aria-label="InkForge reference board"
            className={"max-h-[76vh] w-[min(92vw,420px)] overflow-y-auto rounded-2xl border border-slate-700 bg-[#0d1726] p-4 text-slate-100 shadow-2xl"}
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>STUDIO / REFERENCES</p>
                <h2 className="mt-1 text-lg font-semibold">Visual research</h2>
              </div>
              <span className="rounded-full border border-current/15 px-2 py-1 font-mono text-[10px] opacity-60">LOCAL ONLY</span>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              aria-label="Add reference images"
              className="sr-only"
              onChange={(event) => {
                if (event.currentTarget.files) addFiles(event.currentTarget.files);
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full rounded-xl px-3 py-3 text-xs font-bold text-slate-950 transition hover:brightness-110"
              style={{ backgroundColor: accent }}
            >
              + Add reference images
            </button>
            <div
              role="region"
              aria-label="Drop reference images here"
              className="mt-2 rounded-lg border border-dashed border-slate-500/40 p-3 text-center text-[11px] opacity-70"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                addFiles(event.dataTransfer.files);
              }}
            >Drop image files here</div>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-500/20 bg-[#111827]">
              {selected ? (
                <div
                  className="relative flex items-center justify-center overflow-hidden"
                  style={{ height: 235 }}
                >
                  <img
                    src={selected.url}
                    alt={`Reference: ${selected.name}`}
                    className="max-h-full max-w-full"
                    draggable={false}
                    style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)` }}
                  />
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center text-center text-xs text-slate-400">
                  Import an image to use as a drawing reference.
                </div>
              )}
            </div>
            {selected && (
              <div className="mt-2 flex flex-wrap justify-between gap-2 font-mono text-[10px] opacity-60">
                <span className="max-w-56 truncate" title={selected.name}>{selected.name}</span>
                <span>{formatSize(selected.file.size)} · {selected.file.type || "image"}</span>
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" disabled={!selected} onClick={removeSelected} className="rounded-lg border border-red-400/30 px-3 py-1.5 text-[11px] text-red-300 disabled:opacity-30">Remove image</button>
              <button type="button" disabled={!images.length} onClick={clearBoard} className="rounded-lg border border-red-400/30 px-3 py-1.5 text-[11px] text-red-300 disabled:opacity-30">Clear all</button>
            </div>
            <div className="mt-4 space-y-2 rounded-xl border border-current/10 p-3 text-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Image adjustments</p>
              <label className="flex items-center gap-3">Zoom<input aria-label="Zoom" className="ml-auto w-28" type="range" min={25} max={250} step={5} value={zoom} onChange={(event) => setZoom(Number(event.target.value))}/><span className="w-8 text-right font-mono text-[10px]">{zoom}</span></label>
              <button type="button" onClick={() => setRotation((value) => (value + 90) % 360)} className="rounded-lg border border-current/20 px-2 py-1">Rotate 90°</button>
            </div>
            <div className="mt-4 border-t border-current/10 pt-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-[10px] font-bold uppercase tracking-wider opacity-60">Reference library</h3>
                <button type="button" onClick={() => setGridView((value) => !value)} className="rounded border border-current/20 px-2 py-1 text-[10px]">{gridView ? "List view" : "Grid view"}</button>
              </div>
              <div className={gridView ? "grid grid-cols-4 gap-2" : "flex flex-col gap-2"}>
                {visibleImages.map((image) => (
                  <button
                    type="button"
                    key={image.id}
                    title={image.name}
                    aria-label={`Select ${image.name}`}
                    aria-pressed={selectedId === image.id}
                    onClick={() => setSelectedId(image.id)}
                    className={`relative overflow-hidden rounded-lg border p-1 text-left ${selectedId === image.id ? "border-sky-400" : "border-slate-500/30"}`}
                  >
                    <img alt="" src={image.url} className="h-14 w-full rounded object-cover" />
                    {!gridView && <span className="block truncate text-[10px]" title={image.name}>{image.name}</span>}
                  </button>
                ))}
              </div>
            </div>
            {message && <p role="status" className="mt-3 text-[11px] opacity-70">{message}</p>}
            <p className="mt-3 border-t border-current/10 pt-3 text-[10px] opacity-50">
              Images stay in this browser tab. Nothing is uploaded to a server.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
