import { useState } from "react";
import CanvasSurface from "./CanvasSurface";
import { PENCIL_GRADES } from "./brushes/pencil";
import type { PencilGrade } from "./brushes/pencil";
import {
  Brush, ChevronDown, CircleHelp, Eye, EyeOff,
  FilePlus2, Grid2X2, Hand, Layers3, LockKeyhole,
  MousePointer2, PanelBottomClose,
  PanelBottomOpen, PenTool, Pencil, Plus,
  Redo2, Settings2, SlidersHorizontal,
  Undo2, ZoomIn, ZoomOut
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ToolId = "select" | "pencil" | "ink" | "eraser" | "hand";
type Layer = {
  id: number;
  name: string;
  visible: boolean;
  locked: boolean;
};

const tools: {
  id: ToolId;
  label: string;
  shortcut: string;
  icon: LucideIcon;
}[] = [
  { id: "select", label: "Selection", shortcut: "V", icon: MousePointer2 },
  { id: "pencil", label: "Pencil", shortcut: "B", icon: Pencil },
  { id: "ink", label: "Ink Pen", shortcut: "I", icon: PenTool },
  { id: "eraser", label: "Eraser", shortcut: "E", icon: Brush },
  { id: "hand", label: "Hand", shortcut: "H", icon: Hand }
];

const initialLayers: Layer[] = [
  { id: 3, name: "Sketch", visible: true, locked: false },
  { id: 2, name: "Ink", visible: true, locked: false },
  { id: 1, name: "Paper", visible: true, locked: true }
];

function App() {
  const [activeTool, setActiveTool] = useState<ToolId>("pencil");
  const [layers, setLayers] = useState<Layer[]>(initialLayers);
  const [selectedLayer, setSelectedLayer] = useState(3);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [showTimeline, setShowTimeline] = useState(true);
  const [brushSize, setBrushSize] = useState(8);
  const [pencilGrade, setPencilGrade] = useState<PencilGrade>("HB");

  const selectedTool = tools.find((tool) => tool.id === activeTool)!;

  function addLayer() {
    const id = Math.max(...layers.map((layer) => layer.id)) + 1;
    setLayers((current) => [
      { id, name: `Layer ${id}`, visible: true, locked: false },
      ...current
    ]);
    setSelectedLayer(id);
  }

  function toggleVisibility(id: number) {
    setLayers((current) =>
      current.map((layer) =>
        layer.id === id
          ? { ...layer, visible: !layer.visible }
          : layer
      )
    );
  }

  return (
    <div className="flex h-screen min-w-[1050px] flex-col overflow-hidden bg-[#101114] text-[#e8e6e1]">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/8 bg-[#17181b] px-5">
        <div className="flex items-center gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#cba879] text-[#151515]">
            <PenTool size={20} strokeWidth={2} />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-tight">InkForge</h1>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8b8b8d]">
              Digital Drawing Studio
            </p>
          </div>
          <div className="ml-5 h-7 w-px bg-white/10" />
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Untitled Artwork</span>
            <ChevronDown size={14} className="text-[#86868a]" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-[#9b9ba0]">
            Workspace Preview
          </span>
          <button className="rounded-lg p-2 text-[#a0a0a5] hover:bg-white/10" title="Help">
            <CircleHelp size={18} />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[66px] shrink-0 flex-col items-center gap-2 border-r border-white/8 bg-[#191a1e] py-5">
          <span className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-[#85858a]">
            Tools
          </span>
          {tools.map(({ id, label, shortcut, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTool(id)}
              title={`${label} (${shortcut})`}
              className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                activeTool === id
                  ? "bg-[#cba879] text-[#181818] shadow-lg"
                  : "text-[#a5a5aa] hover:bg-white/8 hover:text-white"
              }`}
            >
              <Icon size={21} strokeWidth={1.8} />
            </button>
          ))}
          <div className="my-3 h-px w-8 bg-white/10" />
          <button
            title="Toggle grid"
            onClick={() => setShowGrid((current) => !current)}
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
              showGrid ? "bg-white/15 text-white" : "text-[#a5a5aa] hover:bg-white/8"
            }`}
          >
            <Grid2X2 size={20} />
          </button>
          <div className="flex-1" />
          <Settings2 size={19} className="mb-3 text-[#717176]" />
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/8 bg-[#17181b] px-5">
            <div className="flex items-center gap-3">
              <selectedTool.icon size={17} className="text-[#cba879]" />
              <span className="text-sm font-medium">{selectedTool.label}</span>
              <span className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-[#99999e]">
                {selectedTool.shortcut}
              </span>
              <div className="mx-2 h-5 w-px bg-white/10" />
              <span className="text-xs text-[#a0a0a5]">Size</span>
              <input
                type="range"
                min="1"
                max="80"
                value={brushSize}
                onChange={(event) => setBrushSize(Number(event.target.value))}
                className="w-24 accent-[#cba879]"
                aria-label="Brush size"
              />
              <span className="w-8 text-right text-xs">{brushSize}px</span>
            </div>
            <div className="flex items-center gap-2 text-[#65656b]">
              <Undo2 size={18} aria-label="Undo unavailable" />
              <Redo2 size={18} aria-label="Redo unavailable" />
            </div>
          </div>

          <section className="workspace-grid relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-10">
            <div
              className="artboard relative aspect-[4/3] w-full max-w-[760px] shrink-0 overflow-hidden bg-[#f3f0e8] shadow-[0_20px_80px_#00000065]"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              {showGrid && <div className="paper-grid absolute inset-0" />}
              <CanvasSurface
                tool={
                  activeTool === "pencil"
                    ? "pencil"
                    : activeTool === "ink"
                      ? "ink"
                      : "none"
                }
                brushSize={brushSize}
                pencilGrade={pencilGrade}
              />
              <span className="absolute bottom-4 right-5 text-[10px] uppercase tracking-[0.15em] text-[#b4b0a8]">
                InkForge / Artboard 01
              </span>
            </div>
            <div className="absolute bottom-4 left-5 rounded-lg border border-white/10 bg-[#1b1c20] px-3 py-2 text-[11px] text-[#9c9ca1]">
              1920 × 1440 px · RGB
            </div>
          </section>

          <div className="flex h-12 shrink-0 items-center justify-between border-t border-white/8 bg-[#17181b] px-5">
            <div className="flex items-center gap-2 text-xs text-[#99999e]">
              <FilePlus2 size={15} />
              <span>Untitled Artwork</span>
              <span className="ml-2 text-[#68686e]">Layout preview</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setZoom((value) => Math.max(50, value - 10))}>
                <ZoomOut size={17} />
              </button>
              <span className="w-12 text-center text-xs">{zoom}%</span>
              <button onClick={() => setZoom((value) => Math.min(150, value + 10))}>
                <ZoomIn size={17} />
              </button>
              <div className="mx-2 h-5 w-px bg-white/10" />
              <button
                onClick={() => setShowTimeline((value) => !value)}
                title="Toggle animation timeline"
              >
                {showTimeline ? <PanelBottomClose size={18} /> : <PanelBottomOpen size={18} />}
              </button>
            </div>
          </div>

          {showTimeline && (
            <section className="h-36 shrink-0 border-t border-white/8 bg-[#191a1e]">
              <div className="flex h-10 items-center justify-between border-b border-white/8 px-5">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold">Animation Timeline</span>
                  <span className="text-[11px] text-[#79797e]">12 FPS · Preview</span>
                </div>
                <span className="text-[11px] text-[#79797e]">Frame 001</span>
              </div>
              <div className="flex items-start gap-2 px-5 py-4">
                <div className="flex h-16 w-24 items-center justify-center rounded-lg border border-[#cba879] bg-[#302a23] text-xs text-[#cba879]">
                  Frame 01
                </div>
                {Array.from({ length: 6 }, (_, index) => (
                  <div
                    key={index}
                    className="flex h-16 w-24 items-center justify-center rounded-lg border border-dashed border-white/10 text-xs text-[#57575e]"
                  >
                    {String(index + 2).padStart(2, "0")}
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        <aside className="flex w-[274px] shrink-0 flex-col border-l border-white/8 bg-[#1b1c20]">
          <div className="flex h-14 items-center justify-between border-b border-white/8 px-5">
            <div className="flex items-center gap-2">
              <Layers3 size={17} className="text-[#cba879]" />
              <span className="text-sm font-semibold">Layers</span>
            </div>
            <button
              onClick={addLayer}
              title="Add layer"
              className="rounded-lg p-2 text-[#a8a8ad] hover:bg-white/10 hover:text-white"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-3">
            {layers.map((layer) => (
              <div
                key={layer.id}
                onClick={() => setSelectedLayer(layer.id)}
                className={`mb-2 flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${
                  selectedLayer === layer.id
                    ? "border-[#cba879]/50 bg-[#cba879]/10"
                    : "border-transparent bg-[#25262b] hover:bg-[#2c2d33]"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/10 bg-[#34353a]">
                  {layer.locked ? <LockKeyhole size={15} /> : <Layers3 size={16} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{layer.name}</p>
                  <p className="mt-1 text-[10px] text-[#85858a]">
                    {layer.locked ? "Locked" : "Normal · 100%"}
                  </p>
                </div>
                <button
                  title={layer.visible ? "Hide layer" : "Show layer"}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleVisibility(layer.id);
                  }}
                  className="text-[#96969c] hover:text-white"
                >
                  {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            ))}
          </div>
          <div className="border-t border-white/8 p-5">
            <div className="mb-4 flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-[#cba879]" />
              <span className="text-sm font-semibold">Brush Properties</span>
            </div>
            <div className="mb-3 flex items-center justify-between text-xs">
              <span className="text-[#9b9ba0]">Brush</span>
              <span>{selectedTool.label}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#9b9ba0]">Size</span>
              <span>{brushSize}px</span>
            </div>
            {activeTool === "pencil" && (
              <div className="mt-5">
                <p className="mb-3 text-xs text-[#9b9ba0]">
                  Graphite Grade
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {PENCIL_GRADES.map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setPencilGrade(grade)}
                      aria-pressed={pencilGrade === grade}
                      className={`rounded-md border py-2 text-xs ${
                        pencilGrade === grade
                          ? "border-[#cba879] bg-[#cba879]/15 text-[#cba879]"
                          : "border-white/10 bg-[#25262b] text-[#a5a5aa] hover:bg-white/10"
                      }`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p className="mt-5 text-[11px] leading-relaxed text-[#77777d]">
              Brush rendering and pressure sensitivity will be added in upcoming pull requests.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
