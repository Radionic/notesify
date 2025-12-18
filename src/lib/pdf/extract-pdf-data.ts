import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import type { PdfPageBboxes } from "@/db/schema";
import { renderPageToCanvas } from "./canvas";
import { sanitizePdfText } from "./sanitize-text";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export type PdfTextBbox = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  start: number;
  end: number;
};

type PdfJsTextItem = {
  str?: string;
  transform?: number[];
  width?: number;
  height?: number;
};

const extractPageImage = async (
  page: PDFPageProxy,
  pageNumber: number,
): Promise<File> => {
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
  return new File([blob], `p-${pageNumber}.jpg`, { type: "image/jpeg" });
};

export const extractPageTextData = async (
  page: PDFPageProxy,
): Promise<{
  text: string;
  bboxes: PdfTextBbox[];
}> => {
  const viewport = page.getViewport({ scale: 1 });
  const textContent = await page.getTextContent();
  const items = textContent.items as PdfJsTextItem[];
  
  const parts = items.map((item) =>
    typeof item?.str === "string" ? sanitizePdfText(item.str) : "",
  );

  const rawText = parts.join(" ");
  const trimmedText = rawText.trim();
  const leadingTrim = rawText.length - rawText.trimStart().length;

  const pageBboxes: PdfTextBbox[] = [];
  let rawCursor = 0;
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const str = parts[i] ?? "";

    if (i > 0) {
      rawCursor += 1; // For the space
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

  return {
    text: trimmedText,
    bboxes: pageBboxes,
  };
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

  const results = await Promise.all(
    Array.from({ length: pdfDocument.numPages }, async (_, i) => {
      const pageNumber = i + 1;
      const page = await pdfDocument.getPage(pageNumber);

      const [textData, image] = await Promise.all([
        extractPageTextData(page),
        extractPageImage(page, pageNumber),
      ]);

      return {
        pageNumber,
        text: textData.text,
        bboxes: textData.bboxes,
        image,
      };
    }),
  );

  return {
    texts: results.map((r) => r.text),
    images: results.map((r) => r.image),
    bboxes: results.map((r) => ({
      page: r.pageNumber,
      bboxes: r.bboxes,
    })),
    totalPages: pdfDocument.numPages,
  };
};
