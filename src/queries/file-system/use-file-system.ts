import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { FileNode, Pdf } from "@/db/schema";
import { removeNativeFile, writeNativeFile } from "@/lib/tauri";
import {
  getFileFn,
  getFilesFn,
  removeFileFn,
  renameFileFn,
} from "@/server/file-system";
import { addPdfFn } from "@/server/pdf";

export const useFile = ({ id, enabled }: { id: string; enabled?: boolean }) => {
  const getFile = useServerFn(getFileFn);
  return useQuery({
    queryKey: ["file", id],
    queryFn: () => getFile({ data: { id } }),
    enabled: enabled && !!id,
  });
};

export const useFiles = ({
  parentId,
  enabled,
}: {
  parentId: string | null;
  enabled?: boolean;
}) => {
  const getFiles = useServerFn(getFilesFn);
  return useQuery({
    queryKey: ["files", parentId],
    queryFn: () => getFiles({ data: { parentId } }),
    enabled,
  });
};

export const useAddPdf = () => {
  const queryClient = useQueryClient();
  const addPdf = useServerFn(addPdfFn);

  return useMutation({
    mutationFn: async ({ name, pdfData }: { name: string; pdfData: Blob }) => {
      const { newFile, newPdf } = await addPdf({ data: { name } });
      await writeNativeFile("pdfs", `${newPdf.id}.pdf`, pdfData);

      return { newFile, newPdf };
    },
    onSuccess: ({ newFile, newPdf }, { pdfData }) => {
      queryClient.setQueryData<FileNode[]>(["files", null], (oldData) => {
        if (!oldData) {
          return [newFile];
        }
        return [newFile, ...oldData];
      });
      queryClient.setQueryData<FileNode>(["file", newFile.id], newFile);
      queryClient.setQueryData<Blob>(["pdf-data", newPdf.id], pdfData);
      queryClient.setQueryData<Pdf>(["pdf", newPdf.id], newPdf);
    },
  });
};

export const useRemovePdf = () => {
  const queryClient = useQueryClient();
  const removeFile = useServerFn(removeFileFn);
  return useMutation({
    mutationFn: async ({ fileId }: { fileId: string }) => {
      await removeNativeFile("pdfs", fileId);
      await removeFile({ data: { id: fileId } });
    },
    onSuccess: (_, { fileId }) => {
      queryClient.setQueryData<FileNode[]>(["files", null], (oldData) => {
        if (!oldData) return;
        return oldData.filter((oldFile) => oldFile.id !== fileId);
      });
      queryClient.setQueryData<FileNode>(["file", fileId], undefined);
      queryClient.setQueryData<Blob>(["pdf-data", fileId], undefined);
      queryClient.setQueryData<Pdf>(["pdf", fileId], undefined);
    },
  });
};

export const useRenamePdf = () => {
  const queryClient = useQueryClient();
  const renameFile = useServerFn(renameFileFn);
  return useMutation({
    mutationFn: async ({
      pdfId,
      newName,
    }: {
      pdfId: string;
      newName: string;
    }) => {
      await renameFile({ data: { id: pdfId, name: newName } });
    },
    onSuccess: (_, { pdfId, newName }) => {
      queryClient.setQueryData<FileNode>(["file", pdfId], (oldData) =>
        oldData
          ? {
              ...oldData,
              name: newName,
              updatedAt: new Date(),
            }
          : undefined,
      );
      queryClient.setQueryData<FileNode[]>(["files", null], (oldData = []) =>
        oldData.map((file) => {
          if (file.id !== pdfId) {
            return file;
          }
          return { ...file, name: newName };
        }),
      );
    },
  });
};
