import { getDefaultStore } from "jotai";
import { AnnotationMode, GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import { EventBus, LinkTarget, PDFViewer } from "pdfjs-dist/web/pdf_viewer.mjs";
import { useCallback } from "react";
import {
  activePdfIdAtom,
  currentPageAtomFamily,
  documentAtomFamily,
  openedPdfIdsAtom,
  pdfPreviewAtom,
  renderedPagesAtomFamily,
  viewerAtomFamily,
} from "@/atoms/pdf/pdf-viewer";
import type { Pdf } from "@/db/schema";
import { CustomLinkService } from "@/lib/pdf/link-service";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export const useLoadPdf = () => {
  const loadPdf = useCallback(
    async ({
      pdf,
      pdfData,
      container,
    }: {
      pdf: Pdf;
      pdfData: Blob;
      container: HTMLDivElement | null;
    }) => {
      if (!pdf || !pdfData || !container) {
        throw new Error("Failed to load PDF");
      }

      console.log("Loading PDF", pdf.id);

      // Load PDF document
      const buffer = await pdfData.arrayBuffer();
      const loadingTask = getDocument(buffer);
      const pdfDocument = await loadingTask.promise;

      const eventBus = new EventBus();
      const linkService = new CustomLinkService({
        eventBus,
        externalLinkTarget: LinkTarget.BLANK,
      });
      const pdfViewer = new PDFViewer({
        container,
        eventBus,
        linkService,
        annotationMode: AnnotationMode.ENABLE,
        textLayerMode: 1,
        removePageBorders: true,
      });

      linkService.setDocument(pdfDocument);
      linkService.setViewer(pdfViewer);
      pdfViewer.setDocument(pdfDocument);

      // Update pdf states
      const store = getDefaultStore();
      store.set(activePdfIdAtom, pdf.id);
      store.set(openedPdfIdsAtom, (currentIds) => [...currentIds, pdf.id]);
      store.set(documentAtomFamily(pdf.id), pdfDocument);
      store.set(viewerAtomFamily(pdf.id), pdfViewer);
      linkService.setInternalLinkClickHandler(({ pageNumber, destArray }) => {
        store.set(pdfPreviewAtom, {
          pdfId: pdf.id,
          pageNumber,
          destArray,
        });
      });

      // Setup event listeners
      eventBus.on("pagesloaded", () => {
        store.set(currentPageAtomFamily(pdf.id), 1);

        const zoomScale = pdf.zoom ?? 1;
        const scrollPositions = pdf.scroll;
        pdfViewer.currentScale = zoomScale;
        container.scrollTo(scrollPositions?.x ?? 0, scrollPositions?.y ?? 0);
      });

      eventBus.on("pagerendered", () => {
        // TODO: a better event for this?
        const renderedPages = (pdfViewer._pages
          ?.filter((p) => p.canvas)
          .map((p) => p.id) || []) as number[];
        store.set(renderedPagesAtomFamily(pdf.id), renderedPages);
      });

      eventBus.on("pagechanging", (evt: { pageNumber: number }) => {
        store.set(currentPageAtomFamily(pdf.id), evt.pageNumber);
      });

      // If PDF viewer is initialized twice, it may:
      // 1. show no pages after opening the PDF
      // 2. show error "offsetParent is not set" when zooming
      console.log("PDF viewer initialized");
    },
    [],
  );

  return loadPdf;
};

export const useUnloadPdf = () => {
  const unloadPdf = useCallback(async ({ pdfId }: { pdfId: string }) => {
    console.log("Unloading PDF", pdfId);
    const store = getDefaultStore();
    store.set(activePdfIdAtom, undefined);
    store.set(openedPdfIdsAtom, (currentIds) =>
      currentIds.filter((id) => id !== pdfId),
    );
    const documentAtom = documentAtomFamily(pdfId);
    await store.get(documentAtom)?.destroy();
    store.set(documentAtom, undefined);
    store.set(viewerAtomFamily(pdfId), undefined);
    store.set(currentPageAtomFamily(pdfId), undefined);
    store.set(renderedPagesAtomFamily(pdfId), []);
  }, []);

  return unloadPdf;
};
