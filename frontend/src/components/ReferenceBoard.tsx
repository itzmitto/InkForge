import { useRef, useState, useEffect } from "react";
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
  const [flippedX, setFlippedX] = useState(false);
  const [flippedY, setFlippedY] = useState(false);
  const [grayscale, setGrayscale] = useState(false);
  const [sepia, setSepia] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [fit, setFit] = useState<"contain" | "cover">("contain");
  const [imageOpacity, setImageOpacity] = useState(100);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [sortByName, setSortByName] = useState(false);
  const [accent, setAccent] = useState(() => {
    try {
      const saved = window.localStorage.getItem("inkforge-ref-accent");
      return saved && ["#93c5fd", "#c4b5fd", "#86efac", "#fbbf24"].includes(saved)
        ? saved
        : "#93c5fd";
    } catch {
      return "#93c5fd";
    }
  });

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

  function resetAdjustments() {
    setZoom(100);
    setRotation(0);
    setFlippedX(false);
    setFlippedY(false);
    setGrayscale(false);
    setSepia(false);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setFit("contain");
    setImageOpacity(100);
  }

  function toggleFavorite() {
    if (!selected) return;
    setImages((current) => current.map((image) =>
      image.id === selected.id ? { ...image, favorite: !image.favorite } : image
    ));
  }

  function downloadReference() {
    if (!selected) return;
    const link = document.createElement("a");
    link.href = selected.url;
    link.download = selected.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function copyReference() {
    if (!selected) return;
    try {
      const blob = await selected.file.arrayBuffer();
      const bitmap = await createImageBitmap(new Blob([blob], { type: selected.file.type }));
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas unavailable");
      context.drawImage(bitmap, 0, 0);
      bitmap.close();
      const png = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => result ? resolve(result) : reject(new Error("PNG conversion failed")), "image/png");
      });
      await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
      setMessage("Reference copied as PNG.");
    } catch {
      setMessage("Clipboard image copy is not supported here.");
    }
  }

  function navigate(delta: number) {
    if (images.length === 0) return;
    const index = images.findIndex((image) => image.id === selectedId);
    setSelectedId(images[(index + delta + images.length) % images.length].id);
  }

  useEffect(() => {
    try {
      window.localStorage.setItem("inkforge-ref-accent", accent);
    } catch {
      // Storage may be unavailable in private browsing.
    }
  }, [accent]);
  const visibleImages = images.filter((image) =>
    (!favoritesOnly || image.favorite) &&
    image.name.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => sortByName ? a.name.localeCompare(b.name) : a.addedAt - b.addedAt);

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
            <label className="mt-3 flex items-center justify-between gap-2 text-xs">
              Accent color
              <select aria-label="Reference board accent" value={accent} onChange={(event) => setAccent(event.target.value)} className="rounded border border-slate-500/40 bg-slate-800 px-2 py-1 text-white">
                <option value="#93c5fd">Glacier</option>
                <option value="#c4b5fd">Iris</option>
                <option value="#86efac">Moss</option>
                <option value="#fbbf24">Amber</option>
              </select>
            </label>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-500/20 bg-[#111827]">
              {selected ? (
                <div
                  className="relative flex items-center justify-center overflow-hidden"
                  style={{ height: 235 }}
                  tabIndex={0}
                  role="group"
                  aria-label="Reference preview; use left and right arrow keys"
                  onKeyDown={(event) => {
                    if (event.key === "ArrowLeft") { event.preventDefault(); navigate(-1); }
                    if (event.key === "ArrowRight") { event.preventDefault(); navigate(1); }
                  }}
                >
                  <img
                    src={selected.url}
                    alt={`Reference: ${selected.name}`}
                    className="max-h-full max-w-full"
                    draggable={false}
                    style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg) scaleX(${flippedX ? -1 : 1}) scaleY(${flippedY ? -1 : 1})`, filter: `grayscale(${grayscale ? 100 : 0}%) sepia(${sepia ? 100 : 0}%) brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`, objectFit: fit, width: "100%", height: "100%", opacity: imageOpacity / 100 }}
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
              <button type="button" disabled={!selected} onClick={toggleFavorite} className="rounded-lg border border-current/20 px-3 py-1.5 text-[11px] disabled:opacity-30">{selected?.favorite ? "★ Favorited" : "☆ Favorite"}</button>
              <button type="button" disabled={!selected} onClick={downloadReference} className="rounded-lg border border-current/20 px-3 py-1.5 text-[11px] disabled:opacity-30">Download</button>
              <button type="button" disabled={!selected} onClick={copyReference} className="rounded-lg border border-current/20 px-3 py-1.5 text-[11px] disabled:opacity-30">Copy image</button>
            </div>
            <div className="mt-4 space-y-2 rounded-xl border border-current/10 p-3 text-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Image adjustments</p>
              <label className="flex items-center gap-3">Zoom<input aria-label="Zoom" className="ml-auto w-28" type="range" min={25} max={250} step={5} value={zoom} onChange={(event) => setZoom(Number(event.target.value))}/><span className="w-8 text-right font-mono text-[10px]">{zoom}</span></label>
              <button type="button" onClick={() => setRotation((value) => (value + 90) % 360)} className="rounded-lg border border-current/20 px-2 py-1">Rotate 90°</button>
              <button type="button" onClick={() => setFlippedX((value) => !value)} className="ml-2 rounded-lg border border-current/20 px-2 py-1">Flip horizontal</button>
              <button type="button" onClick={() => setFlippedY((value) => !value)} className="ml-2 rounded-lg border border-current/20 px-2 py-1">Flip vertical</button>
              <label className="flex items-center gap-2"><input type="checkbox" checked={grayscale} onChange={(event) => setGrayscale(event.target.checked)}/>Grayscale</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={sepia} onChange={(event) => setSepia(event.target.checked)}/>Sepia</label>
              <label className="flex items-center gap-3">Brightness<input aria-label="Brightness" className="ml-auto w-28" type="range" min={25} max={200} step={5} value={brightness} onChange={(event) => setBrightness(Number(event.target.value))}/><span className="w-8 text-right font-mono text-[10px]">{brightness}</span></label>
              <label className="flex items-center gap-3">Contrast<input aria-label="Contrast" className="ml-auto w-28" type="range" min={25} max={200} step={5} value={contrast} onChange={(event) => setContrast(Number(event.target.value))}/><span className="w-8 text-right font-mono text-[10px]">{contrast}</span></label>
              <label className="flex items-center gap-3">Saturation<input aria-label="Saturation" className="ml-auto w-28" type="range" min={0} max={200} step={5} value={saturation} onChange={(event) => setSaturation(Number(event.target.value))}/><span className="w-8 text-right font-mono text-[10px]">{saturation}</span></label>
              <label className="flex items-center gap-3">Blur<input aria-label="Blur" className="ml-auto w-28" type="range" min={0} max={12} step={1} value={blur} onChange={(event) => setBlur(Number(event.target.value))}/><span className="w-8 text-right font-mono text-[10px]">{blur}</span></label>
              <button type="button" onClick={() => setFit((value) => value === "contain" ? "cover" : "contain")} className="rounded-lg border border-current/20 px-2 py-1">Image fit: {fit}</button>
              <label className="flex items-center gap-3">Opacity<input aria-label="Opacity" className="ml-auto w-28" type="range" min={10} max={100} step={5} value={imageOpacity} onChange={(event) => setImageOpacity(Number(event.target.value))}/><span className="w-8 text-right font-mono text-[10px]">{imageOpacity}</span></label>
              <button type="button" onClick={resetAdjustments} className="rounded-lg border border-current/20 px-2 py-1">Reset adjustments</button>
            </div>
            <div className="mt-4 border-t border-current/10 pt-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-[10px] font-bold uppercase tracking-wider opacity-60">Reference library</h3>
                <button type="button" onClick={() => setGridView((value) => !value)} className="rounded border border-current/20 px-2 py-1 text-[10px]">{gridView ? "List view" : "Grid view"}</button>
              </div>
              <label className="flex items-center gap-2 text-[11px]"><input type="checkbox" checked={favoritesOnly} onChange={(event) => setFavoritesOnly(event.target.checked)}/>Favorites only</label>
              <input aria-label="Search reference images" type="search" placeholder="Search by filename" value={search} onChange={(event) => setSearch(event.target.value)} className="my-2 w-full rounded-lg border border-slate-500/30 bg-slate-900 p-2 text-xs text-white" />
              <button type="button" onClick={() => setSortByName((value) => !value)} className="mb-2 rounded border border-current/20 px-2 py-1 text-[11px]">Sort: {sortByName ? "name" : "added"}</button>
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
                    {image.favorite && <span className="absolute right-1 top-0 text-yellow-300">★</span>}
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
