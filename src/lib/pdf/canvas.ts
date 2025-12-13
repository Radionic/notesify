import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import type { PdfPageBboxes, PdfTextBbox } from "@/db/schema";
import { sanitizePdfText } from "@/lib/pdf/sanitize-text";

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

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get 2D canvas context");
  }
  ctx.scale(pixelRatio, pixelRatio);

  await page.render({
    canvas,
    canvasContext: ctx,
    viewport,
  }).promise;

  return {
    width: viewport.width,
    height: viewport.height,
    scale,
  };
};

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

type PdfJsTextItem = {
  str?: string;
  transform?: number[];
  width?: number;
  height?: number;
};

export const extractPdfPageData = async (
  pdfData: Blob,
): Promise<{
  texts: string[];
  images: File[];
  totalPages: number;
  bboxes: PdfPageBboxes[];
}> => {
  const buffer = await pdfData.arrayBuffer();
  const loadingTask = getDocument(buffer);
  const pdfDocument: PDFDocumentProxy = await loadingTask.promise;

  const texts: string[] = [];
  const images: File[] = [];
  const bboxes: PdfPageBboxes[] = [];

  for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
    const page = await pdfDocument.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    const textContent = await page.getTextContent();

    const items = textContent.items as PdfJsTextItem[];
    const parts = items.map((item) =>
      typeof item?.str === "string" ? sanitizePdfText(item.str) : "",
    );

    const rawText = parts.join(" ");
    const trimmedText = rawText.trim();
    const leadingTrim = rawText.length - rawText.trimStart().length;

    texts.push(trimmedText);

    const pageBboxes: PdfTextBbox[] = [];
    let rawCursor = 0;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const str = parts[i] ?? "";

      if (i > 0) {
        rawCursor += 1;
      }

      const startRaw = rawCursor;
      const endRaw = startRaw + str.length;
      rawCursor = endRaw;

      if (!str) {
        continue;
      }

      const start = startRaw - leadingTrim;
      const end = endRaw - leadingTrim;
      if (end <= 0 || start >= trimmedText.length) {
        continue;
      }

      const x =
        typeof item?.transform?.[4] === "number" ? item.transform[4] : 0;
      const y =
        typeof item?.transform?.[5] === "number" ? item.transform[5] : 0;
      const w = typeof item?.width === "number" ? item.width : 0;
      const h =
        typeof item?.height === "number" && item.height > 0
          ? item.height
          : typeof item?.transform?.[3] === "number"
            ? Math.abs(item.transform[3])
            : 0;

      const [x1, y1, x2, y2] = viewport.convertToViewportRectangle([
        x,
        y,
        x + w,
        y + h,
      ]);
      const leftPx = Math.min(x1, x2);
      const rightPx = Math.max(x1, x2);
      const topPx = Math.min(y1, y2);
      const bottomPx = Math.max(y1, y2);

      const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

      pageBboxes.push({
        top: clamp01(topPx / viewport.height),
        left: clamp01(leftPx / viewport.width),
        right: clamp01(rightPx / viewport.width),
        bottom: clamp01(bottomPx / viewport.height),
        start: Math.max(0, start),
        end: Math.min(trimmedText.length, end),
      });
    }

    bboxes.push({ page: pageNumber, bboxes: pageBboxes });

    const canvas = document.createElement("canvas");
    await renderPageToCanvas(page, canvas, 1, 1.5);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (!b) {
            reject(new Error("Failed to create JPEG blob"));
            return;
          }
          resolve(b);
        },
        "image/jpeg",
        0.8,
      );
    });
    images.push(
      new File([blob], `p-${pageNumber}.jpg`, { type: "image/jpeg" }),
    );
  }

  return { texts, bboxes, images, totalPages: pdfDocument.numPages };
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
