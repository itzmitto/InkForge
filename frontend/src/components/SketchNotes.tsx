import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";

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

  async function importNotes(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      window.alert("Choose a TXT file smaller than 1 MB.");
      input.value = "";
      return;
    }
    try {
      setNotes(await file.text());
      setCopied(false);
    } catch {
      window.alert("Unable to import the TXT file.");
    }
    input.value = "";
  }

  function clearNotes() {
    if (notes && window.confirm("Clear your sketch notes?")) {
      setNotes("");
      setCopied(false);
    }
  }

  function insertTimestamp() {
    setNotes((current) =>
      `${current}${current && !current.endsWith("\n") ? "\n" : ""}${new Date().toLocaleString()}\n`
    );
    setCopied(false);
  }

  function insertPlanningTemplate() {
    const template = "Subject:\nPose:\nLighting:\nMaterials:\nNext steps:\n";
    setNotes((current) => `${current}${current && !current.endsWith("\n") ? "\n" : ""}${template}`);
    setCopied(false);
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
          <button type="button" onClick={insertPlanningTemplate} className="rounded border border-white/20 px-2 py-1.5 text-xs hover:bg-white/10">
            Sketch Template
          </button>
          <button type="button" onClick={insertTimestamp} className="rounded border border-white/20 px-2 py-1.5 text-xs hover:bg-white/10">
            Insert Date
          </button>
          <button type="button" disabled={!notes} onClick={clearNotes} className="rounded border border-red-400/30 px-2 py-1.5 text-xs text-red-200 hover:bg-red-500/10 disabled:opacity-40">
            Clear Notes
          </button>
          <label className="cursor-pointer rounded border border-white/20 px-2 py-1.5 text-xs hover:bg-white/10">
            Import TXT
            <input type="file" accept=".txt,text/plain" onChange={importNotes} className="sr-only" />
          </label>
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
