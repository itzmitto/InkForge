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

export function createArtworkPng(): Promise<Blob> {
  const canvas = createArtworkCanvas();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("PNG export failed"));
      }
    }, "image/png");
  });
}

export async function downloadArtwork(): Promise<void> {
  const blob = await createArtworkPng();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "inkforge-artwork.png";

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
