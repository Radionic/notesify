import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDefaultStore, useAtom } from "jotai";
import { AnnotationMode, getDocument } from "pdfjs-dist";
import {
  EventBus,
  PDFLinkService,
  PDFViewer,
} from "pdfjs-dist/web/pdf_viewer.mjs";
import { toast } from "sonner";
import { notesOpenAtom } from "@/atoms/notes/notes";
import {
  activePdfIdAtom,
  currentPageAtomFamily,
  documentAtomFamily,
  openedPdfIdsAtom,
  renderedPagesAtomFamily,
  viewerAtomFamily,
} from "@/atoms/pdf/pdf-viewer";
import type { Pdf, ScrollPosition } from "@/db/schema";
import { fetchFileBlob } from "@/lib/storage";
import { getRouter } from "@/router";
import { getPdfFn, updatePdfFn } from "@/server/pdf";

export const usePdf = ({
  pdfId,
  enabled,
}: {
  pdfId: string;
  enabled?: boolean;
}) => {
  const getPdf = useServerFn(getPdfFn);

  return useQuery({
    queryKey: ["pdf", pdfId],
    queryFn: () => getPdf({ data: { id: pdfId } }),
    retry: 0,
    enabled,
    throwOnError: true,
  });
};

export const usePdfData = ({
  pdfId,
  enabled,
}: {
  pdfId: string;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ["pdf-data", pdfId],
    queryFn: async () => {
      const data = await fetchFileBlob({
        type: "pdfs",
        filename: `${pdfId}.pdf`,
        errorMessage: "Failed to load PDF data",
      });
      if (!data) {
        throw new Error("Failed to load PDF data");
      }
      return data;
    },
    retry: 0,
    enabled,
    throwOnError: true,
  });
};

export const useUpdatePdf = () => {
  const queryClient = useQueryClient();
  const updatePdf = useServerFn(updatePdfFn);

  return useMutation({
    mutationFn: async ({
      pdfId,
      pageCount,
      scroll,
      zoom,
    }: {
      pdfId: string;
      pageCount?: number;
      scroll?: ScrollPosition;
      zoom?: number;
    }) => {
      const updatedPdf = {
        id: pdfId,
        pageCount,
        scroll,
        zoom,
      } as Pdf;
      return await updatePdf({ data: updatedPdf });
    },
    onSuccess: (updatedFields, { pdfId }) => {
      queryClient.setQueryData<Pdf | null>(["pdf", pdfId], (oldData) => {
        if (!oldData) return null;
        return {
          ...oldData,
          ...updatedFields,
        };
      });
    },
  });
};

export const useLoadPdf = () => {
  const updatePdf = useServerFn(updatePdfFn);
  const getPdf = useServerFn(getPdfFn);

  const loadPdf = async ({
    pdfId,
    container,
  }: {
    pdfId: string;
    container: HTMLDivElement | null;
  }) => {
    const pdf = await getPdf({ data: { id: pdfId } });
    const pdfData = await fetchFileBlob({
      type: "pdfs",
      filename: `${pdfId}.pdf`,
      errorMessage: "Failed to load PDF data",
    });
    if (!pdf || !pdfData || !container) {
      throw new Error("Failed to load PDF");
    }

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
    const store = getDefaultStore();
    store.set(activePdfIdAtom, pdf.id);
    store.set(openedPdfIdsAtom, (currentIds) => [...currentIds, pdf.id]);
    store.set(documentAtomFamily(pdf.id), pdfDocument);
    store.set(viewerAtomFamily(pdf.id), pdfViewer);

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

    eventBus.on("pagechanging", (evt: any) => {
      store.set(currentPageAtomFamily(pdf.id), evt.pageNumber);
    });

    // If PDF viewer is initialized twice, it may:
    // 1. show no pages after opening the PDF
    // 2. show error "offsetParent is not set" when zooming
    console.log("PDF viewer initialized");

    await updatePdf({
      data: { id: pdf.id, pageCount: pdfDocument.numPages },
    });
  };

  const unloadPdf = async ({ pdfId }: { pdfId: string }) => {
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
  };

  return { loadPdf, unloadPdf };
};

export const useConvertPdf = () => {
  return useMutation({
    mutationFn: async ({
      file,
      filename,
    }: {
      file: Blob;
      filename: string;
    }) => {
      const formData = new FormData();
      formData.append("files", file, filename);

      // Send the file to Gotenberg for conversion
      const response = await fetch(
        // TODO: use env variable / let user configure
        "http://localhost:8123/forms/libreoffice/convert",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error("Failed to convert to PDF");
      }

      const pdfBlob = await response.blob();
      return pdfBlob;
    },
  });
};

export const useDownloadPdf = () => {
  return useMutation({
    mutationFn: async ({
      pdfId,
      filename,
    }: {
      pdfId: string;
      filename: string;
    }) => {
      const pdfData = await fetchFileBlob({
        type: "pdfs",
        filename: `${pdfId}.pdf`,
        errorMessage: "Failed to load PDF data",
      });
      if (!pdfData) {
        toast.error("Failed to download PDF");
        return;
      }

      filename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;

      const url = URL.createObjectURL(pdfData);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
  });
};

export const useNavigatePdf = () => {
  const [notesOpen, setNotesOpen] = useAtom(notesOpenAtom);

  const navigatePdf = async ({
    pdfId,
    openNotes,
    page,
  }: {
    pdfId: string;
    openNotes?: boolean;
    page?: number;
  }) => {
    const open = notesOpen || !!openNotes;
    // const notesId = open ? (await getNotesForPdf({ pdfId })).id : undefined;
    setNotesOpen(open);

    getRouter().navigate({
      to: "/viewer",
      search: (prev) => ({
        ...prev,
        // nid: notesId,
        sid: pdfId,
        page,
      }),
    });
  };

  return { navigatePdf };
};
