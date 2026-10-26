import { useState } from "react";

const PROMPTS = [
  { text: "Sketch a hand holding a pencil", category: "Anatomy", difficulty: "Easy" },
  { text: "Draw a face from a three-quarter angle", category: "Anatomy", difficulty: "Medium" },
  { text: "Draw a full-body warrior in a dynamic pose", category: "Anatomy", difficulty: "Hard" },
  { text: "Sketch an ancient magical sword", category: "Fantasy", difficulty: "Easy" },
  { text: "Draw a gothic knight with detailed armor", category: "Fantasy", difficulty: "Medium" },
  { text: "Illustrate a ruined fantasy throne room", category: "Fantasy", difficulty: "Hard" },
  { text: "Sketch a small sleeping dragon", category: "Creatures", difficulty: "Easy" },
  { text: "Draw a dragon head with detailed scales", category: "Creatures", difficulty: "Medium" },
  { text: "Draw a full dragon spreading its wings", category: "Creatures", difficulty: "Hard" },
  { text: "Sketch a mountain silhouette", category: "Environments", difficulty: "Easy" },
  { text: "Draw a mysterious forest entrance", category: "Environments", difficulty: "Medium" },
  { text: "Illustrate a gothic castle above a stormy sea", category: "Environments", difficulty: "Hard" },
] as const;

type PromptCategory = "All" | (typeof PROMPTS)[number]["category"];

export default function DrawingPrompts() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [category, setCategory] = useState<PromptCategory>("All");

  const visiblePrompts = PROMPTS.filter(
    (prompt) =>
      (category === "All" || prompt.category === category)
  );

  const selectedPrompt =
    visiblePrompts[index % visiblePrompts.length] ?? PROMPTS[0];

  function nextPrompt() {
    setIndex((current) => (current + 1) % visiblePrompts.length);
  }

  return (
    <aside
      aria-label="Drawing prompt generator"
      className="fixed right-5 top-1/2 z-40 w-64 -translate-y-1/2 rounded-xl border border-white/15 bg-[#191a1f]/95 p-3 text-white shadow-xl"
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="w-full rounded-lg border border-white/15 px-3 py-2 text-left text-xs font-semibold hover:bg-white/10"
      >
        {open ? "Hide Drawing Prompts" : "Drawing Prompts"}
      </button>

      {open && (
        <div className="mt-3">
          <p className="text-[11px] uppercase tracking-wider text-[#cba879]">
            Sketch Inspiration
          </p>

          <label className="mt-3 block text-xs text-white/70">
            Category
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value as PromptCategory);
                setIndex(0);
              }}
              className="mt-1 w-full rounded border border-white/20 bg-[#292a30] px-2 py-2 text-white"
            >
              <option value="All">All Categories</option>
              <option value="Anatomy">Anatomy</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Creatures">Creatures</option>
              <option value="Environments">Environments</option>
            </select>
          </label>

          <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-sm leading-relaxed">
              {selectedPrompt.text}
            </p>
            <p className="mt-2 text-[11px] text-white/50">
              {selectedPrompt.category} · {selectedPrompt.difficulty}
            </p>
          </div>

          <button
            type="button"
            onClick={nextPrompt}
            className="mt-3 w-full rounded-lg bg-[#cba879] px-3 py-2 text-xs font-semibold text-[#191a1f] hover:opacity-90"
          >
            Next Prompt
          </button>
        </div>
      )}
    </aside>
  );
}
