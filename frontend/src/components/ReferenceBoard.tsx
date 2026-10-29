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
  const [, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const accent = "#93c5fd";


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
