import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pdf, ScrollPosition } from "@/db/schema";
import { dbService } from "@/lib/db";
import { isTauri } from "@/lib/tauri";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { toast } from "sonner";
import { readNativeFile } from "@/lib/tauri";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";
import { loadPdfDocumentAtom, unloadPdfDocumentAtom } from "@/actions/pdf/pdf";
import { useAtom } from "jotai";
import { useNavigate } from "@tanstack/react-router";
import { notesOpenAtom } from "@/atoms/notes/notes";
import { openedPdfIdsAtom } from "@/atoms/pdf/pdf-viewer";
import { useCreateNotes } from "../notes/use-notes";
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
  const queryClient = useQueryClient();
  const loadPdfDocument = useSetAtom(loadPdfDocumentAtom);
  const unloadPdfDocument = useSetAtom(unloadPdfDocumentAtom);
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
      pdfDataQueryOptions({ pdfId })
    );
    if (!pdf || !pdfData || !container) {
      throw new Error("Failed to load PDF");
    }

    const pdfDocument = await loadPdfDocument({ pdf, pdfData, container });
    await updatePdf({ pdfId: pdf.id, pageCount: pdfDocument.numPages });
  };

  const unloadPdf = async ({ pdfId }: { pdfId: string }) => {
    await unloadPdfDocument(pdfId);
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
        }
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
        pdfDataQueryOptions({ pdfId })
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
  const navigate = useNavigate();
  const [notesOpen, setNotesOpen] = useAtom(notesOpenAtom);
  const { mutateAsync: createNotes } = useCreateNotes();

  const navigatePdf = async ({
    pdfId,
    openNotes,
  }: {
    pdfId: string;
    openNotes?: boolean;
  }) => {
    const open = notesOpen || !!openNotes;
    const notesId = open
      ? (await dbService.notes.getNotesForPdf(pdfId)) ||
        (await createNotes({ pdfId })).id
      : undefined;
    setNotesOpen(open);

    navigate({
      to: "/viewer",
      search: (prev) => ({
        ...prev,
        nid: notesId,
        sid: pdfId,
      }),
    });
  };

  return { navigatePdf };
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
            fileQueryOptions({ id: pdfId })
          );
          if (!pdf || !pdfFile) {
            return null;
          }
          return {
            id: pdf.id,
            name: pdfFile.name,
            pageCount: pdf.pageCount,
          };
        })
      );
      return openedPdfs.filter((pdf) => pdf !== null);
    },
    enabled: pdfIds.length > 0,
  });
};
