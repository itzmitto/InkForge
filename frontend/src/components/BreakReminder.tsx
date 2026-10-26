import { useEffect, useState } from "react";

export default function BreakReminder() {
  const [elapsed, setElapsed] = useState(0);
  const [snoozeRemaining, setSnoozeRemaining] = useState(0);
  const [enabled, setEnabled] = useState(() => {
    try {
      return (
        window.localStorage.getItem("inkforge-break-enabled") !== "false"
      );
    } catch {
      return true;
    }
  });
  const [breakMinutes, setBreakMinutes] = useState(() => {
    try {
      const stored = Number(
        window.localStorage.getItem("inkforge-break-minutes")
      );
      return [5, 10, 20, 30, 45, 60].includes(stored)
        ? stored
        : 20;
    } catch {
      return 20;
    }
  });

  const remaining =
    Math.max(0, breakMinutes * 60 - elapsed) + snoozeRemaining;
  const due = enabled && remaining === 0;

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (enabled && document.visibilityState === "visible") {
        setElapsed((current) =>
          Math.min(current + 1, breakMinutes * 60)
        );
        setSnoozeRemaining((current) => Math.max(0, current - 1));
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [enabled, breakMinutes]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "inkforge-break-enabled",
        String(enabled)
      );
      window.localStorage.setItem(
        "inkforge-break-minutes",
        String(breakMinutes)
      );
    } catch {
      return;
    }
  }, [enabled, breakMinutes]);

  return (
    <aside
      aria-label="Drawing break reminder"
      className="fixed right-5 top-20 z-40 w-56 rounded-xl border border-white/15 bg-[#191a1f]/95 p-4 text-white shadow-xl"
    >
      <p className="text-xs font-semibold">Break Reminder</p>
      <button
        type="button"
        aria-pressed={enabled}
        onClick={() => setEnabled((current) => !current)}
        className="mt-2 rounded border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10"
      >
        {enabled ? "Disable" : "Enable"}
      </button>
      <label className="mt-3 flex items-center justify-between gap-2 text-xs text-white/70">
        Interval
        <select
          value={breakMinutes}
          onChange={(event) => {
            setBreakMinutes(Number(event.target.value));
            setElapsed(0);
            setSnoozeRemaining(0);
          }}
          className="rounded border border-white/20 bg-[#292a30] px-2 py-1 text-white"
        >
          <option value={5}>5 min</option>
          <option value={10}>10 min</option>
          <option value={20}>20 min</option>
          <option value={30}>30 min</option>
          <option value={45}>45 min</option>
          <option value={60}>60 min</option>
        </select>
      </label>
      <p aria-live="polite" className="mt-2 text-xs text-white/70">
        {!enabled
          ? "Reminders disabled"
          : due
            ? "Time to take a break!"
            : `${Math.ceil(remaining / 60)} minutes until break`}
      </p>
      {due && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setElapsed(0);
              setSnoozeRemaining(0);
            }}
            className="rounded border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10"
          >
            Start Next Cycle
          </button>
          <button
            type="button"
            onClick={() => setSnoozeRemaining(300)}
            className="rounded border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10"
          >
            Snooze 5 Minutes
          </button>
        </div>
      )}
    </aside>
  );
}
