function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-12 py-16 text-center shadow-2xl">
        <div className="mb-6 text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
          Digital Drawing Studio
        </div>
        <h1 className="text-6xl font-bold tracking-tight">
          InkForge
        </h1>
        <p className="mt-5 text-zinc-400">
          Create. Sketch. Illustrate.
        </p>
        <div className="mt-8 flex justify-center gap-3 text-xs text-zinc-500">
          <span>Swift</span>
          <span>React</span>
          <span>TypeScript</span>
          <span>Tailwind CSS</span>
        </div>
      </div>
    </main>
  );
}

export default App;
