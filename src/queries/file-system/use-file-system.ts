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
import { getFileDataFn } from "@/server/storage";

export const useFile = ({ id }: { id?: string }) => {
  const getFile = useServerFn(getFileFn);
  return useQuery({
    queryKey: ["file", id],
    queryFn: () => (id ? getFile({ data: { id } }) : null),
    enabled: !!id,
  });
};

export const useFileData = ({
  id,
  type,
}: {
  id?: string;
  type: "pdfs" | "recordings" | "images";
}) => {
  const getFileData = useServerFn(getFileDataFn);

  return useQuery({
    queryKey: ["file-data", type, id],
    queryFn: async () => {
      if (!id) return null;
      const res = await getFileData({
        data: { type, fileId: id },
      });
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
    }: {
      fileId: string;
      parentId: string | null;
      type: FileNode["type"];
    }) => {
      await removeFile({ data: { id: fileId } });
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
        queryClient.setQueryData<Blob>(
          ["file-data", "pdfs", fileId],
          undefined,
        );
        queryClient.setQueryData<Pdf>(["pdf", fileId], undefined);
      } else if (type === "image") {
        queryClient.setQueryData<Blob>(
          ["file-data", "images", fileId],
          undefined,
        );
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
