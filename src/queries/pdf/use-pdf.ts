import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useAtom } from "jotai";
import { notesOpenAtom } from "@/atoms/notes/notes";
import type { Pdf, ScrollPosition } from "@/db/schema";
import { getPdfFn, updatePdfFn } from "@/server/pdf";
import { getFileDataFn } from "@/server/storage";

export const usePdf = ({ pdfId }: { pdfId: string }) => {
  const getPdf = useServerFn(getPdfFn);

  return useQuery({
    queryKey: ["pdf", pdfId],
    queryFn: () => getPdf({ data: { id: pdfId } }),
    retry: 0,
    enabled: !!pdfId,
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
  const getFileData = useServerFn(getFileDataFn);

  return useMutation({
    mutationFn: async ({
      pdfId,
      filename,
    }: {
      pdfId: string;
      filename: string;
    }) => {
      filename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;

      const response = await getFileData({
        data: { type: "pdfs", filename: `${pdfId}.pdf` },
      });
      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    },
  });
};

export const useNavigatePdf = () => {
  const [notesOpen, setNotesOpen] = useAtom(notesOpenAtom);
  const router = useRouter();

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

    router.navigate({
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
