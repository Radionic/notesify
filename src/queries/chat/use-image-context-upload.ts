import { useIsMutating, useMutation } from "@tanstack/react-query";
import { useAtom, useSetAtom } from "jotai";
import { useState } from "react";
import { toast } from "sonner";
import { activeContextsAtom, type ImageContext } from "@/atoms/chat/contexts";
import {
  useDeleteFile,
  useUploadFile,
} from "@/queries/file-system/use-file-upload";

export const useRemoveImageContext = () => {
  const [contexts, setContexts] = useAtom(activeContextsAtom);
  const { mutateAsync: deleteFile } = useDeleteFile();

  return useMutation({
    mutationFn: async (fileId: string) => {
      const targetContext = contexts.find(
        (context) => context.type === "image" && context.fileId === fileId,
      ) as ImageContext;
      if (!targetContext) {
        throw new Error("Context not found");
      }

      await deleteFile({ fileId: targetContext.fileId });
      setContexts((prevContexts) =>
        prevContexts.filter(
          (c) => c.type !== "image" || c.fileId !== targetContext.fileId,
        ),
      );
    },
    onError: () => {
      toast.error("Failed to remove image");
    },
  });
};

export const useUploadImageContext = ({
  mutationKey,
}: {
  mutationKey?: string;
} = {}) => {
  const [progress, setProgress] = useState(0);
  const setContexts = useSetAtom(activeContextsAtom);
  const { mutateAsync: uploadFile } = useUploadFile();

  const mutation = useMutation({
    mutationKey: ["upload-context", mutationKey],
    mutationFn: async ({ file }: { file: File }) => {
      setProgress(0);

      const { id: fileId } = await uploadFile({
        file,
        fileType: "image",
        parentId: null,
        inLibrary: false,
        onProgress: setProgress,
      });

      setProgress(100);

      return fileId;
    },
    onSuccess: (fileId) => {
      setContexts((prevContexts) => [
        ...prevContexts,
        {
          type: "image",
          fileId,
        },
      ]);
    },
    onError: () => {
      toast.error("Failed to upload image");
    },
  });

  return {
    ...mutation,
    progress,
  };
};

export const useHasPendingContextUpload = () => {
  return (
    useIsMutating({
      mutationKey: ["upload-context"],
    }) > 0
  );
};
