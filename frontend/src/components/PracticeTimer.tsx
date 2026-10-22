import { useEffect, useState } from "react";

function formatElapsed(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining = seconds % 60;

  return [hours, minutes, remaining]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export default function PracticeTimer() {
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible" && !paused) {
        setElapsed((current) => current + 1);
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [paused]);

  return (
    <aside
      aria-label="Drawing practice timer"
      className="fixed bottom-5 right-5 z-40 rounded-xl border border-white/15 bg-[#191a1f]/95 px-4 py-3 text-white shadow-xl"
    >
      <p className="text-[11px] text-white/60">
        Drawing Practice
      </p>
      <p className="mt-1 font-mono text-lg font-semibold">
        {formatElapsed(elapsed)}
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setPaused((current) => !current)}
          className="rounded-md border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10"
        >
          {paused ? "Resume" : "Pause"}
        </button>
        <button
          type="button"
          onClick={() => setElapsed(0)}
          className="rounded-md border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10"
        >
          Reset
        </button>
      </div>
    </aside>
  );
}
