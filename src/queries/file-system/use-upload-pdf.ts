import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import type { FileNode, Pdf } from "@/db/schema";
import { extractPdfPageData } from "@/lib/pdf/extract-pdf-data";
import { completePdfUploadFn, createPdfUploadUrlsFn } from "@/server/upload";
import type { FilesResult } from "./use-file-system";
import { uploadFileToPresignedUrl } from "./use-file-upload";

export const useUploadPdf = ({
  mutationKey,
}: {
  mutationKey?: string;
} = {}) => {
  const [progress, setProgress] = useState(0);
  const queryClient = useQueryClient();
  const createPdfUploadUrls = useServerFn(createPdfUploadUrlsFn);
  const completePdfUpload = useServerFn(completePdfUploadFn);

  const mutation = useMutation({
    mutationKey: ["upload-pdf", mutationKey],
    mutationFn: async ({
      file,
      parentId,
      inLibrary = true,
    }: {
      file: File;
      parentId: string | null;
      inLibrary?: boolean;
    }) => {
      const name = file.name;

      if (file.size > 50 * 1024 * 1024) {
        toast.error("PDF file too large. Max size is 50MB");
        throw new Error("PDF file too large");
      }

      setProgress(5);

      const { texts, images, totalPages, bboxes } =
        await extractPdfPageData(file);

      setProgress(15);

      const oversizedImage = images.find(
        (image) => image.size > 10 * 1024 * 1024,
      );
      if (oversizedImage) {
        toast.error("Extracted PDF image too large. Max size is 10MB per page");
        throw new Error("Extracted PDF image too large");
      }

      const upload = await createPdfUploadUrls({
        data: {
          imageCount: images.length,
        },
      });

      setProgress(20);

      if (upload.imageUploads.length !== images.length) {
        throw new Error("Image upload metadata mismatch");
      }

      const totalUploads = images.length + 1;
      const uploadProgress = new Array(totalUploads).fill(0);
      const emitProgress = () => {
        const averageProgress =
          uploadProgress.reduce((sum, progress) => sum + progress, 0) /
          totalUploads;
        const adjustedProgress = Math.round(20 + averageProgress * 0.7);
        const nextProgress = Math.min(90, adjustedProgress);
        setProgress(nextProgress);
      };

      await Promise.all([
        uploadFileToPresignedUrl({
          file,
          uploadUrl: upload.pdfUploadUrl,
          contentType: "application/pdf",
          onProgress: (progress) => {
            uploadProgress[0] = progress;
            emitProgress();
          },
        }),
        ...images.map((image, index) =>
          uploadFileToPresignedUrl({
            file: image,
            uploadUrl: upload.imageUploads[index].uploadUrl,
            contentType: "image/jpeg",
            onProgress: (progress) => {
              uploadProgress[index + 1] = progress;
              emitProgress();
            },
          }),
        ),
      ]);

      const { newFile, newPdf } = await completePdfUpload({
        data: {
          fileId: upload.fileId,
          name,
          parentId,
          totalPages,
          texts,
          bboxes,
          inLibrary,
        },
      });

      setProgress(100);

      return { newFile, newPdf };
    },
    onSuccess: ({ newFile, newPdf }, { file }) => {
      queryClient.setQueryData<FilesResult>(
        ["files", newFile.parentId, ""],
        (oldData) => ({
          files: oldData ? [newFile, ...oldData.files] : [newFile],
          breadcrumbs: oldData?.breadcrumbs ?? null,
        }),
      );
      queryClient.setQueryData<FileNode>(["file", newFile.id], newFile);
      queryClient.setQueryData<Blob>(["file-data", "pdfs", newPdf.id], file);
      queryClient.setQueryData<Pdf>(["pdf", newPdf.id], newPdf);
    },
    onError: () => {
      toast.error("Upload failed");
    },
  });

  return {
    ...mutation,
    progress,
  };
};
