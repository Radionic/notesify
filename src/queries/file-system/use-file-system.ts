import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { FileNode, Pdf } from "@/db/schema";
import {
  addFolderFn,
  type BreadcrumbItem,
  getFileFn,
  getFilesFn,
  removeFileFn,
  renameFileFn,
} from "@/server/file-system";
import { addPdfFn } from "@/server/pdf";
import {
  getFileUrlFn,
  removeFileFn as removeStorageFileFn,
  uploadFileFn,
} from "@/server/storage";

export const useFile = ({ id, enabled }: { id: string; enabled?: boolean }) => {
  const getFile = useServerFn(getFileFn);
  return useQuery({
    queryKey: ["file", id],
    queryFn: () => getFile({ data: { id } }),
    enabled: enabled && !!id,
  });
};

export const useFileData = ({
  id,
  type,
}: {
  id: string;
  type: "pdfs" | "recordings";
}) => {
  const getFileUrl = useServerFn(getFileUrlFn);

  return useQuery({
    queryKey: ["file-data", id],
    queryFn: async () => {
      const ext = type === "pdfs" ? ".pdf" : ".webm";
      const url = await getFileUrl({
        data: { type, filename: `${id}${ext}` },
      });

      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`Failed to load data: ${id}`);
      }

      return await res.blob();
    },
    enabled: !!id,
  });
};

export type FilesResult = {
  files: FileNode[];
  breadcrumbs: BreadcrumbItem[] | null;
};

export const useFiles = ({
  parentId,
  search,
  includeBreadcrumbs,
}: {
  parentId: string | null;
  search?: string;
  includeBreadcrumbs?: boolean;
}) => {
  const getFiles = useServerFn(getFilesFn);
  return useQuery({
    queryKey: ["files", parentId, search ?? ""],
    queryFn: () => getFiles({ data: { parentId, search, includeBreadcrumbs } }),
  });
};

export const useAddPdf = () => {
  const queryClient = useQueryClient();
  const addPdf = useServerFn(addPdfFn);
  const uploadFile = useServerFn(uploadFileFn);

  return useMutation({
    mutationFn: async ({
      name,
      pdfData,
      parentId,
    }: {
      name: string;
      pdfData: Blob;
      parentId: string | null;
    }) => {
      const { newFile, newPdf } = await addPdf({ data: { name, parentId } });
      const formData = new FormData();
      formData.append("type", "pdfs");
      formData.append("filename", `${newPdf.id}.pdf`);
      formData.append("file", pdfData);
      await uploadFile({ data: formData });
      return { newFile, newPdf };
    },
    onSuccess: ({ newFile, newPdf }, { pdfData }) => {
      queryClient.setQueryData<FilesResult>(
        ["files", newFile.parentId, ""],
        (oldData) => ({
          files: oldData ? [newFile, ...oldData.files] : [newFile],
          breadcrumbs: oldData?.breadcrumbs ?? null,
        }),
      );
      queryClient.setQueryData<FileNode>(["file", newFile.id], newFile);
      queryClient.setQueryData<Blob>(["file-data", newPdf.id], pdfData);
      queryClient.setQueryData<Pdf>(["pdf", newPdf.id], newPdf);
    },
  });
};

export const useAddFolder = () => {
  const queryClient = useQueryClient();
  const addFolder = useServerFn(addFolderFn);
  return useMutation({
    mutationFn: ({
      name,
      parentId,
    }: {
      name: string;
      parentId: string | null;
    }) => addFolder({ data: { name, parentId } }),
    onSuccess: (newFolder) => {
      queryClient.setQueryData<FilesResult>(
        ["files", newFolder.parentId, ""],
        (oldData) => ({
          files: oldData ? [newFolder, ...oldData.files] : [newFolder],
          breadcrumbs: oldData?.breadcrumbs ?? null,
        }),
      );
    },
  });
};

export const useRemoveFile = () => {
  const queryClient = useQueryClient();
  const removeFile = useServerFn(removeFileFn);
  return useMutation({
    mutationFn: async ({
      fileId,
      parentId,
      type,
    }: {
      fileId: string;
      parentId: string | null;
      type: FileNode["type"];
    }) => {
      if (type === "pdf") {
        await removeStorageFileFn({
          data: { type: "pdfs", filename: `${fileId}.pdf` },
        });
      }
      await removeFile({ data: { id: fileId } });
      return { fileId, parentId, type };
    },
    onSuccess: (_, { fileId, parentId, type }) => {
      queryClient.setQueryData<FilesResult>(
        ["files", parentId, ""],
        (oldData) =>
          oldData
            ? {
                ...oldData,
                files: oldData.files.filter((file) => file.id !== fileId),
              }
            : undefined,
      );
      queryClient.setQueryData<FileNode>(["file", fileId], undefined);
      if (type === "pdf") {
        queryClient.setQueryData<Blob>(["file-data", fileId], undefined);
        queryClient.setQueryData<Pdf>(["pdf", fileId], undefined);
      }
    },
  });
};

export const useRenameFile = () => {
  const queryClient = useQueryClient();
  const renameFile = useServerFn(renameFileFn);
  return useMutation({
    mutationFn: async ({
      id,
      parentId,
      newName,
    }: {
      id: string;
      parentId: string | null;
      newName: string;
    }) => {
      await renameFile({ data: { id, name: newName } });
      return { id, parentId, newName };
    },
    onSuccess: (_, { id, parentId, newName }) => {
      queryClient.setQueryData<FileNode>(["file", id], (oldData) =>
        oldData
          ? { ...oldData, name: newName, updatedAt: new Date() }
          : undefined,
      );
      queryClient.setQueryData<FilesResult>(
        ["files", parentId, ""],
        (oldData) =>
          oldData
            ? {
                ...oldData,
                files: oldData.files.map((file) =>
                  file.id === id
                    ? { ...file, name: newName, updatedAt: new Date() }
                    : file,
                ),
              }
            : undefined,
      );
    },
  });
};
