import type { PDFPageProxy } from "pdfjs-dist";

export interface PageDimensions {
  width: number;
  height: number;
  scale: number;
}

interface ScreenshotArea {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

/**
 * Renders a PDF page to a canvas with the given scale
 */
export const renderPageToCanvas = async (
  page: PDFPageProxy,
  canvas: HTMLCanvasElement,
  scale: number,
  pixelRatio: number = 1,
): Promise<PageDimensions> => {
  const viewport = page.getViewport({ scale });

  // Set physical canvas dimensions (accounting for device pixel ratio)
  const canvasWidth = Math.floor(viewport.width * pixelRatio);
  const canvasHeight = Math.floor(viewport.height * pixelRatio);

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Set display dimensions
  canvas.style.width = `${Math.floor(viewport.width)}px`;
  canvas.style.height = `${Math.floor(viewport.height)}px`;

  const ctx = canvas.getContext("2d")!;
  ctx.scale(pixelRatio, pixelRatio);

  await page.render({
    canvasContext: ctx,
    viewport,
  }).promise;

  return {
    width: viewport.width,
    height: viewport.height,
    scale,
  };
};

/**
 * Captures a screenshot of a specific area from a PDF canvas
 * @param canvas The source canvas to capture from
 * @param area The area coordinates to capture
 * @returns A base64 encoded PNG image string, or null if capture fails
 */
export const captureScreenshot = async (
  canvas: HTMLCanvasElement,
  area: ScreenshotArea,
): Promise<string | null> => {
  // Calculate scale factor between displayed size and actual canvas size
  const scaleFactor = canvas.width / canvas.getBoundingClientRect().width;

  // Create a new canvas for the screenshot
  const screenshotCanvas = document.createElement("canvas");
  const ctx = screenshotCanvas.getContext("2d");
  if (!ctx) return null;

  // Calculate the scaled dimensions and coordinates
  const sourceX = Math.min(area.startX, area.endX) * scaleFactor;
  const sourceY = Math.min(area.startY, area.endY) * scaleFactor;
  const width = Math.abs(area.endX - area.startX) * scaleFactor;
  const height = Math.abs(area.endY - area.startY) * scaleFactor;

  // Set the canvas size to the scaled dimensions
  screenshotCanvas.width = width;
  screenshotCanvas.height = height;

  try {
    // Draw the selected portion of the PDF canvas onto our new canvas
    ctx.drawImage(canvas, sourceX, sourceY, width, height, 0, 0, width, height);

    // Convert to base64
    return screenshotCanvas.toDataURL("image/png");
  } catch (error) {
    console.error("Failed to capture screenshot:", error);
    return null;
  }
};
