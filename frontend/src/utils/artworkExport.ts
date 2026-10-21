export type ArtworkFormat = "png" | "jpeg";

function createArtworkCanvas(): HTMLCanvasElement {
  const source = document.querySelector<HTMLCanvasElement>(
    'canvas[aria-label="InkForge drawing canvas"]'
  );

  if (!source) {
    throw new Error("Drawing canvas not found");
  }

  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas context unavailable");
  }

  context.fillStyle = "#f3f0e8";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(source, 0, 0);

  return canvas;
}

export function createArtworkBlob(
  format: ArtworkFormat = "png"
): Promise<Blob> {
  const canvas = createArtworkCanvas();
  const mimeType = format === "png" ? "image/png" : "image/jpeg";

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Artwork export failed"));
        }
      },
      mimeType,
      0.92
    );
  });
}

export async function downloadArtwork(
  format: ArtworkFormat = "png"
): Promise<void> {
  const blob = await createArtworkBlob(format);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `inkforge-artwork.${format === "jpeg" ? "jpg" : "png"}`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
