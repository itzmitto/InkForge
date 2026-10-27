import { useEffect, useState } from "react";

export default function SketchNotes() {
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState(() => {
    try {
      return window.localStorage.getItem("inkforge-sketch-notes") ?? "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem("inkforge-sketch-notes", notes);
    } catch {
      return;
    }
  }, [notes]);

  async function copyNotes() {
    try {
      await navigator.clipboard.writeText(notes);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function exportNotes() {
    if (!notes) return;
    const blob = new Blob([notes], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "inkforge-sketch-notes.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section aria-label="Sketch notes" className="fixed left-5 top-24 z-40 w-72 max-w-[calc(100vw-2.5rem)] rounded-xl border border-white/15 bg-[#191a1f]/95 p-3 text-white shadow-xl">
      <header className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Sketch Notes</h2>
      </header>
      <div data-sketch-notes-body="true" className="mt-3">
        <textarea
          aria-label="Drawing notes"
          rows={6}
          value={notes}
          onChange={(event) => { setNotes(event.target.value); setCopied(false); }}
          placeholder="Ideas, poses, lighting, references..."
          className="w-full resize-y rounded-lg border border-white/15 bg-[#292a30] p-3 text-sm text-white outline-none focus:border-[#cba879]"
        />
        <div data-sketch-notes-stats="true" className="mt-2 flex flex-wrap gap-3 text-[11px] text-white/60">
          <span>Words: {notes.trim() ? notes.trim().split(/\s+/).length : 0}</span>
          <span>Characters: {notes.length}</span>
          <span>Lines: {notes ? notes.split(/\r?\n/).length : 0}</span>
        </div>
        <div data-sketch-notes-actions="true" className="mt-3 flex flex-wrap gap-2">
          <button type="button" disabled={!notes} onClick={exportNotes} className="rounded border border-white/20 px-2 py-1.5 text-xs hover:bg-white/10 disabled:opacity-40">
            Export TXT
          </button>
          <button type="button" disabled={!notes} onClick={copyNotes} className="rounded border border-white/20 px-2 py-1.5 text-xs hover:bg-white/10 disabled:opacity-40">
            {copied ? "Copied" : "Copy Notes"}
          </button>
        </div>
        <div data-sketch-notes-settings="true" className="mt-3 flex flex-wrap gap-2">
        </div>
      </div>
    </section>
  );
}
