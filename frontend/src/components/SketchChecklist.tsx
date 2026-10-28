import { useEffect, useState } from "react";

type Task = {
  id: string;
  title: string;
  done: boolean;
  priority: "normal" | "high";
};

const DEFAULT_TASKS: Task[] = [
  { id: "base-1", title: "Plan composition", done: false, priority: "normal" },
  { id: "base-2", title: "Sketch basic shapes", done: false, priority: "normal" },
  { id: "base-3", title: "Refine proportions", done: false, priority: "normal" },
  { id: "base-4", title: "Add values and shadows", done: false, priority: "normal" },
  { id: "base-5", title: "Finish details", done: false, priority: "normal" },
];

function initialTasks(): Task[] {
  return DEFAULT_TASKS.map((task) => ({ ...task }));
}

const TASK_STORAGE_KEY = "inkforge-sketch-checklist";

function isTask(value: unknown): value is Task {
  if (typeof value !== "object" || value === null) return false;
  const task = value as Partial<Task>;
  return (
    typeof task.id === "string" &&
    task.id.length > 0 &&
    typeof task.title === "string" &&
    task.title.length > 0 &&
    task.title.length <= 120 &&
    typeof task.done === "boolean" &&
    (task.priority === "normal" || task.priority === "high")
  );
}

function readTasks(): Task[] {
  try {
    const stored = window.localStorage.getItem(TASK_STORAGE_KEY);
    if (!stored) return initialTasks();
    const data: unknown = JSON.parse(stored);
    if (!Array.isArray(data) || data.length > 200 || !data.every(isTask)) {
      return initialTasks();
    }
    if (new Set(data.map((task: Task) => task.id)).size !== data.length) {
      return initialTasks();
    }
    return data;
  } catch {
    return initialTasks();
  }
}

const CHECKLIST_TEMPLATES = [
  {
    id: "portrait",
    label: "Portrait study",
    tasks: ["Find reference", "Block head proportions", "Place facial features", "Model light and shadow", "Refine likeness"],
  },
  {
    id: "character",
    label: "Character design",
    tasks: ["Create silhouette", "Choose costume", "Establish anatomy", "Draw equipment", "Add final textures"],
  },
  {
    id: "landscape",
    label: "Environment sketch",
    tasks: ["Choose horizon", "Block foreground", "Plan focal point", "Establish atmospheric depth", "Add surface details"],
  },
] as const;

function downloadChecklist(filename: string, contents: string, mime: string) {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function SketchChecklist() {
  const [tasks, setTasks] = useState<Task[]>(readTasks);
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "done">("all");
  const [search, setSearch] = useState("");
  const [onlyHigh, setOnlyHigh] = useState(false);
  const [panelOpen, setPanelOpen] = useState(() => {
    try {
      return window.localStorage.getItem("inkforge-checklist-expanded") !== "false";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // The checklist remains usable when storage is unavailable.
    }
  }, [tasks]);

  useEffect(() => {
    try {
      window.localStorage.setItem("inkforge-checklist-expanded", String(panelOpen));
    } catch {
      // Ignore unavailable browser storage.
    }
  }, [panelOpen]);

  function toggleTask(id: string) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }

  function addTask() {
    const title = newTask.trim().slice(0, 120);
    if (!title || tasks.length >= 200) return;
    setTasks((current) => [
      ...current,
      { id: crypto.randomUUID(), title, done: false, priority: "normal" },
    ]);
    setNewTask("");
  }

  function removeTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function saveTaskEdit(id: string) {
    const title = editText.trim().slice(0, 120);
    if (!title) return;
    setTasks((current) =>
      current.map((task) => task.id === id ? { ...task, title } : task)
    );
    setEditingId(null);
    setEditText("");
  }

  const completedCount = tasks.filter((task) => task.done).length;
  const completionPercent = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  const visibleTasks = tasks.filter((task) => {
    if (statusFilter === "active" && task.done) return false;
    if (statusFilter === "done" && !task.done) return false;
    if (!task.title.toLowerCase().includes(search.trim().toLowerCase())) return false;
    if (onlyHigh && task.priority !== "high") return false;
    return true;
  });

  function clearCompleted() {
    if (!tasks.some((task) => task.done)) return;
    if (!window.confirm("Remove all completed sketch tasks?")) return;
    setTasks((current) => current.filter((task) => !task.done));
  }

  function togglePriority(id: string) {
    setTasks((current) => current.map((task) =>
      task.id === id
        ? { ...task, priority: task.priority === "high" ? "normal" : "high" }
        : task
    ));
  }

  function moveTask(id: string, delta: -1 | 1) {
    setTasks((current) => {
      const index = current.findIndex((task) => task.id === id);
      const target = index + delta;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function applyTemplate(templateId: string) {
    const template = CHECKLIST_TEMPLATES.find((item) => item.id === templateId);
    if (!template || !window.confirm("Replace the current checklist with this template?")) return;
    setTasks(template.tasks.map((title, index) => ({
      id: `${templateId}-${index}`,
      title,
      done: false,
      priority: "normal" as const,
    })));
  }

  function exportJson() {
    downloadChecklist(
      "inkforge-sketch-checklist.json",
      JSON.stringify({ version: 1, tasks }, null, 2),
      "application/json;charset=utf-8"
    );
  }

  return (
    <section
      aria-label="Sketch checklist"
      className="fixed bottom-5 left-5 z-50 w-80 max-w-[calc(100vw-2.5rem)] rounded-xl border border-white/20 bg-[#191a1f]/95 p-3 text-white shadow-xl"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Sketch Checklist</h2>
        <button
          type="button"
          aria-expanded={panelOpen}
          onClick={() => setPanelOpen((current) => !current)}
          className="rounded-md border border-white/20 px-2 py-1 text-xs hover:bg-white/10"
        >
          {panelOpen ? "Hide" : "Show"}
        </button>
      </div>
      {panelOpen && (
        <div>
          <p className="mt-2 text-xs text-white/65">
            {completedCount} / {tasks.length} tasks completed
          </p>
          <div
            role="progressbar"
            aria-label="Checklist completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={completionPercent}
            className="mt-2 h-2 overflow-hidden rounded-full bg-white/15"
          >
            <div className="h-full rounded-full bg-[#cba879]" style={{ width: `${completionPercent}%` }} />
          </div>
          <label className="mt-3 block text-xs text-white/70">
            Drawing template
            <select
              defaultValue=""
              onChange={(event) => {
                applyTemplate(event.target.value);
                event.target.value = "";
              }}
              className="mt-1 w-full rounded border border-white/20 bg-[#292a30] px-2 py-1.5 text-white"
            >
              <option value="" disabled>Choose a template</option>
              {CHECKLIST_TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>{template.label}</option>
              ))}
            </select>
          </label>
          <div className="mt-3 flex flex-wrap gap-1" aria-label="Checklist filters">
            {(["all", "active", "done"] as const).map((value) => (
              <button
                type="button"
                key={value}
                aria-pressed={statusFilter === value}
                onClick={() => setStatusFilter(value)}
                className={`rounded border px-2 py-1 text-[11px] ${statusFilter === value ? "border-[#cba879] text-[#cba879]" : "border-white/15 text-white/60"}`}
              >
                {value === "done" ? "Completed" : value === "active" ? "Active" : "All"}
              </button>
            ))}
          </div>
          <input
            type="search"
            aria-label="Search checklist tasks"
            placeholder="Search tasks..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="mt-2 w-full rounded border border-white/20 bg-[#292a30] px-2 py-2 text-xs text-white"
          />
          <label className="mt-2 flex items-center gap-2 text-xs text-white/70">
            <input type="checkbox" checked={onlyHigh} onChange={(event) => setOnlyHigh(event.target.checked)} />
            High priority only
          </label>
          <ul className="mt-3 max-h-[38vh] space-y-1 overflow-y-auto" aria-label="Sketch tasks">
            {visibleTasks.map((task) => (
              <li key={task.id} className="flex items-start gap-2 rounded-md border border-white/10 bg-white/5 p-2">
                <input
                  type="checkbox"
                  aria-label={`Mark ${task.title} as completed`}
                  checked={task.done}
                  onChange={() => toggleTask(task.id)}
                  className="mt-1 accent-[#cba879]"
                />
                {editingId === task.id ? (
                  <form
                    className="flex min-w-0 flex-1 flex-wrap gap-1"
                    onSubmit={(event) => { event.preventDefault(); saveTaskEdit(task.id); }}
                  >
                    <input
                      aria-label="Edit task title"
                      maxLength={120}
                      value={editText}
                      onChange={(event) => setEditText(event.target.value)}
                      className="min-w-0 flex-1 rounded border border-white/20 bg-[#292a30] px-1 text-xs"
                    />
                    <button type="submit" className="text-[11px] text-[#cba879]">Save</button>
                    <button type="button" onClick={() => setEditingId(null)} className="text-[11px] text-white/60">Cancel</button>
                  </form>
                ) : (
                  <span className={`min-w-0 flex-1 break-words text-xs ${task.done ? "text-white/40 line-through" : "text-white/85"}`}>
                    {task.title}
                  </span>
                )}
                <button
                  type="button"
                  aria-pressed={task.priority === "high"}
                  aria-label={`Toggle priority for ${task.title}`}
                  onClick={() => togglePriority(task.id)}
                  className={`rounded px-1 text-[10px] ${task.priority === "high" ? "text-amber-300" : "text-white/40"}`}
                >
                  {task.priority === "high" ? "High" : "Low"}
                </button>
                <button type="button" aria-label={`Move ${task.title} up`} disabled={tasks[0]?.id === task.id} onClick={() => moveTask(task.id, -1)} className="text-xs text-white/60 disabled:opacity-20">↑</button>
                <button type="button" aria-label={`Move ${task.title} down`} disabled={tasks[tasks.length - 1]?.id === task.id} onClick={() => moveTask(task.id, 1)} className="text-xs text-white/60 disabled:opacity-20">↓</button>
                {editingId !== task.id && (
                  <button
                    type="button"
                    aria-label={`Edit ${task.title}`}
                    onClick={() => { setEditingId(task.id); setEditText(task.title); }}
                    className="text-[11px] text-white/60 hover:text-white"
                  >Edit</button>
                )}
                <button
                  type="button"
                  aria-label={`Delete ${task.title}`}
                  onClick={() => removeTask(task.id)}
                  className="text-[11px] text-white/50 hover:text-red-300"
                >Delete</button>
              </li>
            ))}
          </ul>
          {visibleTasks.length === 0 && (
            <p className="mt-2 text-xs text-white/50">No tasks to show.</p>
          )}
          <form
            className="mt-3 flex gap-2"
            onSubmit={(event) => { event.preventDefault(); addTask(); }}
          >
            <input
              aria-label="New sketch task"
              value={newTask}
              maxLength={120}
              onChange={(event) => setNewTask(event.target.value)}
              placeholder="New sketch task..."
              className="min-w-0 flex-1 rounded border border-white/20 bg-[#292a30] px-2 py-2 text-xs text-white"
            />
            <button type="submit" disabled={!newTask.trim() || tasks.length >= 200} className="rounded bg-[#cba879] px-3 py-2 text-xs font-semibold text-[#191a1f] disabled:opacity-40">Add</button>
          </form>
          <button type="button" onClick={clearCompleted} disabled={!tasks.some((task) => task.done)} className="mt-3 rounded border border-red-400/25 px-2 py-1.5 text-[11px] text-red-300 disabled:opacity-40">Clear completed</button>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={exportJson} className="rounded border border-white/20 px-2 py-1.5 text-[11px]">Export JSON</button>
          </div>
        </div>
      )}
    </section>
  );
}
