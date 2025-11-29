import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { getDefaultStore, useAtom, useAtomValue } from "jotai";
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
import { dbService } from "@/lib/db";
import { isTauri, readNativeFile } from "@/lib/tauri";
import { getRouter, queryClient } from "@/router";
import { fileQueryOptions } from "../file-system/use-file-system";

export const pdfQueryOptions = ({
  pdfId,
  enabled,
}: {
  pdfId: string;
  enabled?: boolean;
}) =>
  queryOptions({
    queryKey: ["pdf", pdfId],
    queryFn: () => dbService.pdf.getPdf(pdfId),
    retry: 0,
    enabled,
    throwOnError: true,
  });
export const usePdf = ({
  pdfId,
  enabled,
}: {
  pdfId: string;
  enabled?: boolean;
}) => {
  return useQuery(pdfQueryOptions({ pdfId, enabled }));
};

export const pdfDataQueryOptions = ({
  pdfId,
  enabled,
}: {
  pdfId: string;
  enabled?: boolean;
}) =>
  queryOptions({
    queryKey: ["pdf-data", pdfId],
    queryFn: async () => {
      const data: Blob = await readNativeFile("pdfs", `${pdfId}.pdf`);
      return data;
    },
    retry: 0,
    enabled,
    throwOnError: true,
  });
export const usePdfData = ({ pdfId }: { pdfId: string }) => {
  return useQuery(pdfDataQueryOptions({ pdfId }));
};

export const useUpdatePdf = () => {
  const queryClient = useQueryClient();
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
      return await dbService.pdf.updatePdf(updatedPdf);
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
  const { mutateAsync: updatePdf } = useUpdatePdf();

  const loadPdf = async ({
    pdfId,
    container,
  }: {
    pdfId: string;
    container: HTMLDivElement | null;
  }) => {
    const pdf = await queryClient.fetchQuery(pdfQueryOptions({ pdfId }));
    const pdfData = await queryClient.fetchQuery(
      pdfDataQueryOptions({ pdfId }),
    );
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

    await updatePdf({ pdfId: pdf.id, pageCount: pdfDocument.numPages });
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pdfId,
      filename,
    }: {
      pdfId: string;
      filename: string;
    }) => {
      const pdfData = await queryClient.fetchQuery(
        pdfDataQueryOptions({ pdfId }),
      );
      if (!pdfData) {
        toast.error("Failed to download PDF");
        return;
      }

      filename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
      if (isTauri) {
        const filePath = await save({ defaultPath: filename });
        if (!filePath) return;
        const data = new Uint8Array(await pdfData.arrayBuffer());
        await writeFile(filePath, data);
      } else {
        const url = URL.createObjectURL(pdfData);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
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
    const notesId = open
      ? (await dbService.notes.getNotesForPdf({ pdfId })).id
      : undefined;
    setNotesOpen(open);

    getRouter().navigate({
      to: "/viewer",
      search: (prev) => ({
        ...prev,
        nid: notesId,
        sid: pdfId,
        page,
      }),
    });
  };

  return { navigatePdf };
};

export type OpenedPDF = {
  id: string;
  name: string;
  pageCount: number;
};

export const useOpenedPdfs = () => {
  const queryClient = useQueryClient();
  const pdfIds = useAtomValue(openedPdfIdsAtom);
  return useQuery({
    queryKey: ["opened-pdfs"],
    queryFn: async () => {
      const openedPdfs = await Promise.all(
        pdfIds.map(async (pdfId) => {
          const pdf = await queryClient.fetchQuery(pdfQueryOptions({ pdfId }));
          const pdfFile = await queryClient.fetchQuery(
            fileQueryOptions({ id: pdfId }),
          );
          if (!pdf || !pdfFile) {
            return null;
          }
          return {
            id: pdf.id,
            name: pdfFile.name,
            pageCount: pdf.pageCount,
          };
        }),
      );
      return openedPdfs.filter((pdf) => pdf !== null);
    },
    enabled: pdfIds.length > 0,
  });
};
