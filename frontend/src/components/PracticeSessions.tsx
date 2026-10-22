import { useState } from "react";

type PracticeSession = {
  savedAt: string;
  seconds: number;
};

const STORAGE_KEY = "inkforge-practice-sessions";

function readSessions(): PracticeSession[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];

    return data
      .filter(
        (item): item is PracticeSession =>
          typeof item === "object" &&
          item !== null &&
          typeof item.savedAt === "string" &&
          Number.isFinite(Date.parse(item.savedAt)) &&
          Number.isSafeInteger(item.seconds) &&
          item.seconds > 0
      )
      .slice(0, 100);
  } catch {
    return [];
  }
}

export default function PracticeSessions({
  elapsed,
}: {
  elapsed: number;
}) {
  const [sessions, setSessions] = useState(readSessions);
  const [error, setError] = useState("");

  function saveSession() {
    if (!Number.isSafeInteger(elapsed) || elapsed <= 0) {
      return;
    }

    const next: PracticeSession[] = [
      {
        savedAt: new Date().toISOString(),
        seconds: elapsed,
      },
      ...sessions,
    ].slice(0, 100);

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(next)
      );

      setSessions(next);
      setError("");
    } catch {
      setError("Unable to save session.");
    }
  }

  return (
    <section
      aria-label="Drawing session journal"
      className="mt-4 border-t border-white/15 pt-3"
    >
      <p className="text-xs font-semibold text-white">
        Session Journal
      </p>

      <button
        type="button"
        disabled={elapsed <= 0}
        onClick={saveSession}
        className="mt-2 rounded-md border border-white/20 px-3 py-1.5 text-xs text-white hover:bg-white/10 disabled:opacity-40"
      >
        Save Session
      </button>

      <p className="mt-2 text-[11px] text-white/60">
        Saved sessions: {sessions.length}
      </p>

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-300">
          {error}
        </p>
      )}
    </section>
  );
}
