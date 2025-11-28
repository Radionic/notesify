import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { FileNode, Pdf } from "@/db/schema";
import { dbService } from "@/lib/db";
import { removeNativeFile, writeNativeFile } from "@/lib/tauri";

export const fileQueryOptions = ({
  id,
  enabled,
}: {
  id: string;
  enabled?: boolean;
}) =>
  queryOptions({
    queryKey: ["file", id],
    queryFn: () => dbService.fileSystem.getFile({ id }),
    enabled,
  });
export const useFile = ({ id, enabled }: { id: string; enabled?: boolean }) =>
  useQuery(fileQueryOptions({ id, enabled }));

export const filesQueryOptions = ({
  parentId,
  enabled,
}: {
  parentId: string | null;
  enabled?: boolean;
}) =>
  queryOptions({
    queryKey: ["files", parentId],
    queryFn: () => dbService.fileSystem.getFiles({ parentId }),
    enabled,
  });
export const useFiles = ({
  parentId,
  enabled,
}: {
  parentId: string | null;
  enabled?: boolean;
}) => useQuery(filesQueryOptions({ parentId, enabled }));

export const useAddPdf = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, pdfData }: { name: string; pdfData: Blob }) => {
      const { newFile, newPdf } = await dbService.pdf.addPdf({ name });
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
  return useMutation({
    mutationFn: async ({ fileId }: { fileId: string }) => {
      await removeNativeFile("pdfs", fileId);
      await dbService.fileSystem.removeFile({ id: fileId });
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
  return useMutation({
    mutationFn: async ({
      pdfId,
      newName,
    }: {
      pdfId: string;
      newName: string;
    }) => {
      await dbService.fileSystem.renameFile({ id: pdfId, name: newName });
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
