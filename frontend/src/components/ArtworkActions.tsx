import { useState } from "react";
import { Copy, Download, FileImage } from "lucide-react";
import {
  createArtworkBlob,
  downloadArtwork,
  type ArtworkFormat,
} from "../utils/artworkExport";

export default function ArtworkActions() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleExport(format: ArtworkFormat) {
    if (busy) return;

    setBusy(true);
    setMessage("");

    try {
      await downloadArtwork(format);
      setMessage(`${format.toUpperCase()} exported`);
    } catch {
      setMessage("Export failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy() {
    if (busy) return;

    setBusy(true);
    setMessage("");

    try {
      if (
        !navigator.clipboard?.write ||
        typeof ClipboardItem === "undefined"
      ) {
        throw new Error("Clipboard API unavailable");
      }

      const blob = await createArtworkBlob("png");

      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);

      setMessage("Artwork copied");
    } catch {
      setMessage("Could not copy artwork");
    } finally {
      setBusy(false);
    }
  }

  const buttonClass =
    "flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex shrink-0 items-center justify-end gap-2 border-b border-white/10 bg-[#17181b] px-5 py-2">
      <span role="status" className="mr-2 text-xs text-[#9b9ba0]">
        {message}
      </span>
      <button
        type="button"
        disabled={busy}
        onClick={() => handleExport("png")}
        className={buttonClass}
      >
        <Download size={15} />
        PNG
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => handleExport("jpeg")}
        className={buttonClass}
      >
        <FileImage size={15} />
        JPEG
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={handleCopy}
        className={buttonClass}
      >
        <Copy size={15} />
        Copy Artwork
      </button>
    </div>
  );
}
