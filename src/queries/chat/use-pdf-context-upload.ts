import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useSetAtom } from "jotai";
import { toast } from "sonner";
import { activeContextsAtom } from "@/atoms/chat/contexts";
import type { FileNode } from "@/db/schema";
import { getFileFn } from "@/server/file-system";
import { useDeleteFile } from "../file-system/use-file-upload";
import { useUploadPdf } from "../file-system/use-upload-pdf";

export const useAddLibraryContext = () => {
  const setContexts = useSetAtom(activeContextsAtom);

  return useMutation({
    mutationFn: async (file: FileNode) => {
      setContexts((prev) => {
        const alreadyAdded = prev.some((c) => c.fileId === file.id);
        if (alreadyAdded) return prev;
        if (file.type === "pdf" || file.type === "image")
          return [...prev, { type: file.type, fileId: file.id }];
        return prev;
      });
    },
  });
};

export const useUploadPdfContext = ({
  mutationKey,
}: {
  mutationKey?: string;
} = {}) => {
  const setContexts = useSetAtom(activeContextsAtom);

  const { mutateAsync: upload, ...rest } = useUploadPdf({
    mutationKey: ["upload-context", mutationKey],
    onSuccess: ({ newFile }) => {
      setContexts((prev) => [...prev, { type: "pdf", fileId: newFile.id }]);
    },
  });

  const mutateAsync = ({ file }: { file: File }) =>
    upload({ file, parentId: null, inLibrary: false });

  return { mutateAsync, ...rest };
};

export const useRemovePdfContext = () => {
  const setContexts = useSetAtom(activeContextsAtom);
  const { mutateAsync: deleteFile } = useDeleteFile();
  const queryClient = useQueryClient();
  const getFile = useServerFn(getFileFn);

  return useMutation({
    mutationFn: async (fileId: string) => {
      const file = await queryClient.ensureQueryData<FileNode | null>({
        queryKey: ["file", fileId],
        queryFn: () => getFile({ data: { id: fileId } }),
      });
      if (file && !file.inLibrary) {
        await deleteFile({ fileId });
      }
      setContexts((prev) =>
        prev.filter((c) => c.type !== "pdf" || c.fileId !== fileId),
      );
    },
    onError: () => {
      toast.error("Failed to remove PDF");
    },
  });
};
