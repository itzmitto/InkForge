import { useEffect, useState } from "react";

export default function BreakReminder() {
  const [elapsed, setElapsed] = useState(0);
  const breakMinutes = 20;

  const remaining = Math.max(0, breakMinutes * 60 - elapsed);
  const due = remaining === 0;

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setElapsed((current) =>
          Math.min(current + 1, breakMinutes * 60)
        );
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <aside
      aria-label="Drawing break reminder"
      className="fixed right-5 top-20 z-40 w-56 rounded-xl border border-white/15 bg-[#191a1f]/95 p-4 text-white shadow-xl"
    >
      <p className="text-xs font-semibold">Break Reminder</p>
      <p aria-live="polite" className="mt-2 text-xs text-white/70">
        {due
          ? "Time to take a break!"
          : `${Math.ceil(remaining / 60)} minutes until break`}
      </p>
      {due && (
        <button
          type="button"
          onClick={() => setElapsed(0)}
          className="mt-3 rounded border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10"
        >
          Start Next Cycle
        </button>
      )}
    </aside>
  );
}
