import {
  EventBus,
  PDFLinkService,
  PDFViewer,
} from "pdfjs-dist/web/pdf_viewer.mjs";
import { Pdf } from "@/db/schema";
import {
  activePdfIdAtom,
  currentPageAtomFamily,
  documentAtomFamily,
  viewerAtomFamily,
  renderedPagesAtomFamily,
  openedPdfIdsAtom,
} from "@/atoms/pdf/pdf-viewer";
import { atom } from "jotai";
import { AnnotationMode, getDocument } from "pdfjs-dist";

export const loadPdfDocumentAtom = atom(
  null,
  async (
    get,
    set,
    {
      pdf,
      pdfData,
      container,
    }: {
      pdf: Pdf;
      pdfData: Blob;
      container: HTMLDivElement;
    }
  ) => {
    // Unload previous PDF
    // set(unloadPdfAtom);

    console.log("Loading PDF", pdf.id);

    // Load PDF document
    const buffer = await pdfData.arrayBuffer();
    const loadingTask = getDocument(buffer);
    const pdfDocument = await loadingTask.promise;

    const eventBus = new EventBus();
    const linkService = new PDFLinkService({ eventBus });
    const pdfViewer = new PDFViewer({
      container,
      eventBus,
      linkService,
      annotationMode: AnnotationMode.DISABLE,
      textLayerMode: 1,
      removePageBorders: true,
    });

    linkService.setDocument(pdfDocument);
    linkService.setViewer(pdfViewer);
    pdfViewer.setDocument(pdfDocument);

    // Update pdf states
    set(activePdfIdAtom, pdf.id);
    set(openedPdfIdsAtom, (currentIds) => [...currentIds, pdf.id]);
    set(documentAtomFamily(pdf.id), pdfDocument);
    set(viewerAtomFamily(pdf.id), pdfViewer);

    // Setup event listeners
    eventBus.on("pagesloaded", () => {
      set(currentPageAtomFamily(pdf.id), 1);

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
      set(renderedPagesAtomFamily(pdf.id), renderedPages);
    });

    eventBus.on("pagechanging", (evt: any) => {
      set(currentPageAtomFamily(pdf.id), evt.pageNumber);
    });

    // If PDF viewer is initialized twice, it may:
    // 1. show no pages after opening the PDF
    // 2. show error "offsetParent is not set" when zooming
    console.log("PDF viewer initialized");
    return pdfDocument;
  }
);

export const unloadPdfDocumentAtom = atom(
  null,
  async (get, set, pdfId: string) => {
    const activePdfId = pdfId; // get(activePdfIdAtom);
    if (activePdfId) {
      console.log("Unloading PDF", activePdfId);
      set(activePdfIdAtom, undefined);
      set(openedPdfIdsAtom, (currentIds) =>
        currentIds.filter((id) => id !== activePdfId)
      );
      const documentAtom = documentAtomFamily(activePdfId);
      await get(documentAtom)?.destroy();
      set(documentAtom, undefined);
      set(viewerAtomFamily(activePdfId), undefined);
      set(currentPageAtomFamily(activePdfId), undefined);
      set(renderedPagesAtomFamily(activePdfId), []);
    }
  }
);
