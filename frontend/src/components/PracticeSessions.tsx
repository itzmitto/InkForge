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

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining = seconds % 60;

  return [hours, minutes, remaining]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export default function PracticeSessions({
  elapsed,
}: {
  elapsed: number;
}) {
  const [sessions, setSessions] = useState(readSessions);
  const [error, setError] = useState("");

  const totalSeconds = sessions.reduce(
    (total, session) => total + session.seconds,
    0
  );

  const longestSession = sessions.reduce(
    (longest, session) => Math.max(longest, session.seconds),
    0
  );

  function exportSessions() {
    if (sessions.length === 0) return;

    const rows = [
      "Date,Seconds",
      ...sessions.map(
        (session) =>
          `${session.savedAt},${session.seconds}`
      ),
    ];

    const blob = new Blob(
      [rows.join("\r\n")],
      { type: "text/csv;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "inkforge-drawing-sessions.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

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

      <button
        type="button"
        disabled={sessions.length === 0}
        onClick={exportSessions}
        className="ml-2 mt-2 rounded-md border border-white/20 px-3 py-1.5 text-xs text-white hover:bg-white/10 disabled:opacity-40"
      >
        Export CSV
      </button>

      <p className="mt-2 text-[11px] text-white/60">
        Saved sessions: {sessions.length}
      </p>

      <p className="mt-2 text-[11px] text-white/70">
        Total practice: {formatDuration(totalSeconds)}
      </p>

      <p className="mt-2 text-[11px] text-white/70">
        Personal best: {formatDuration(longestSession)}
      </p>

      {sessions.length > 0 && (
        <ol className="mt-3 max-h-40 space-y-2 overflow-y-auto">
          {sessions.slice(0, 5).map((session, index) => (
            <li
              key={`${session.savedAt}-${index}`}
              className="flex justify-between gap-3 text-[11px] text-white/70"
            >
              <span>
                {new Date(session.savedAt).toLocaleDateString()}
              </span>
              <span className="font-mono">
                {formatDuration(session.seconds)}
              </span>
            </li>
          ))}
        </ol>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-300">
          {error}
        </p>
      )}
    </section>
  );
}
