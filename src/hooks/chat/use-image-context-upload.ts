import { useMutation } from "@tanstack/react-query";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { type ClipboardEvent, useCallback } from "react";
import { toast } from "sonner";
import { activeContextsAtom, type ImageContext } from "@/atoms/chat/contexts";
import { selectedModelAtom } from "@/atoms/setting/providers";
import { uploadingIdsAtom } from "@/atoms/upload";
import { useUploadStatus } from "@/hooks/upload/use-upload-status";
import { ensureVisionModel } from "@/lib/ai/ensure-vision-model";
import { generateId } from "@/lib/id";
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

export const useUploadImageContext = () => {
  const selectedModel = useAtomValue(selectedModelAtom);
  const setContexts = useSetAtom(activeContextsAtom);
  const setUploadingIds = useSetAtom(uploadingIdsAtom);
  const { updateStatus } = useUploadStatus();
  const { mutateAsync: uploadFile } = useUploadFile();

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!ensureVisionModel({ model: selectedModel })) return;

      const uploadId = generateId();

      setUploadingIds((prev) => [...prev, uploadId]);
      updateStatus(uploadId, { status: "uploading", progress: 0 });

      try {
        const { id: fileId } = await uploadFile({
          file,
          fileType: "image",
          parentId: null,
          inLibrary: false,
          onProgress: (uploadProgress) =>
            updateStatus(uploadId, {
              status: "uploading",
              progress: uploadProgress,
            }),
        });

        setContexts((prevContexts) => [
          ...prevContexts,
          {
            type: "image",
            fileId,
          },
        ]);
        setUploadingIds((prev) => prev.filter((id) => id !== uploadId));
        updateStatus(uploadId, null);
      } catch {
        setUploadingIds((prev) => prev.filter((id) => id !== uploadId));
        updateStatus(uploadId, null);
        toast.error("Failed to upload image");
      }
    },
    [selectedModel, setContexts, setUploadingIds, updateStatus, uploadFile],
  );

  const handlePasteImage = useCallback(
    (e: ClipboardEvent<HTMLTextAreaElement>) => {
      const { files } = e.clipboardData;
      if (!files || files.length === 0) return;

      const imageFile = Array.from(files).find((file) =>
        file.type.startsWith("image/"),
      );
      if (!imageFile) return;

      e.preventDefault();
      handleImageUpload(imageFile);
    },
    [handleImageUpload],
  );

  return {
    handleImageUpload,
    handlePasteImage,
  };
};
