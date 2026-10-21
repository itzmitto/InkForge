import { useState } from "react";
import { Download } from "lucide-react";
import { downloadArtwork } from "../utils/artworkExport";

export default function ArtworkActions() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleExport() {
    if (busy) return;

    setBusy(true);
    setMessage("");

    try {
      await downloadArtwork();
      setMessage("PNG exported");
    } catch {
      setMessage("Export failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex shrink-0 items-center justify-end gap-3 border-b border-white/10 bg-[#17181b] px-5 py-2">
      <span role="status" className="text-xs text-[#9b9ba0]">
        {message}
      </span>
      <button
        type="button"
        disabled={busy}
        onClick={handleExport}
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[#e8e6e1] hover:bg-white/10 disabled:opacity-50"
      >
        <Download size={15} />
        Export PNG
      </button>
    </div>
  );
}
