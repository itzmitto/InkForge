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
  const [elapsed, setElapsed] = useState(() => {
    try {
      const stored = Number(
        window.localStorage.getItem("inkforge-practice-seconds")
      );

      return Number.isSafeInteger(stored) && stored >= 0
        ? stored
        : 0;
    } catch {
      return 0;
    }
  });
  const [paused, setPaused] = useState(() => {
    try {
      return (
        window.localStorage.getItem("inkforge-practice-paused") ===
        "true"
      );
    } catch {
      return false;
    }
  });
  const [goalMinutes, setGoalMinutes] = useState(() => {
    try {
      const stored = Number(
        window.localStorage.getItem("inkforge-practice-goal")
      );
      return [10, 15, 25, 45, 60].includes(stored)
        ? stored
        : 25;
    } catch {
      return 25;
    }
  });

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible" && !paused) {
        setElapsed((current) => current + 1);
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [paused]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "inkforge-practice-seconds",
        String(elapsed)
      );
    } catch {
      return;
    }
  }, [elapsed]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "inkforge-practice-goal",
        String(goalMinutes)
      );
    } catch {
      return;
    }
  }, [goalMinutes]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "inkforge-practice-paused",
        String(paused)
      );
    } catch {
      return;
    }
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
          onClick={() => {
            if (
              elapsed === 0 ||
              window.confirm("Reset your drawing practice timer?")
            ) {
              setElapsed(0);
            }
          }}
          className="rounded-md border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10"
        >
          Reset
        </button>
      </div>
      <label className="mt-3 flex items-center justify-between gap-3 text-xs text-white/70">
        Practice goal
        <select
          value={goalMinutes}
          onChange={(event) =>
            setGoalMinutes(Number(event.target.value))
          }
          className="rounded border border-white/20 bg-[#292a30] px-2 py-1 text-white"
        >
          <option value={10}>10 min</option>
          <option value={15}>15 min</option>
          <option value={25}>25 min</option>
          <option value={45}>45 min</option>
          <option value={60}>60 min</option>
        </select>
      </label>
      <div
        role="progressbar"
        aria-label="Drawing practice progress"
        aria-valuemin={0}
        aria-valuemax={goalMinutes * 60}
        aria-valuenow={Math.min(elapsed, goalMinutes * 60)}
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15"
      >
        <div
          className="h-full rounded-full bg-[#cba879]"
          style={{
            width: `${Math.min(
              100,
              (elapsed / (goalMinutes * 60)) * 100
            )}%`,
          }}
        />
      </div>
      <p className="mt-2 text-[11px] text-white/60">
        {elapsed >= goalMinutes * 60
          ? "Practice goal reached!"
          : `${Math.ceil(
              (goalMinutes * 60 - elapsed) / 60
            )} minutes remaining`}
      </p>
    </aside>
  );
}
