import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getRouter } from "@/router";
import { removeFileFn } from "@/server/file-system";
import { completeUploadFn, createUploadUrlFn } from "@/server/upload";

type UploadableFileType = "image" | "pdf";

export const uploadFileToPresignedUrl = ({
  file,
  uploadUrl,
  contentType,
  onProgress,
}: {
  file: File;
  uploadUrl: string;
  contentType: string;
  onProgress?: (progress: number) => void;
}) =>
  new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", contentType);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }
      const progress = Math.round((event.loaded / event.total) * 100);
      onProgress?.(progress);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }
      reject(new Error(`Upload failed with status ${xhr.status}`));
    };

    xhr.onerror = () => {
      reject(new Error("Upload failed"));
    };

    xhr.send(file);
  });

export const useUploadFile = () => {
  const createUploadUrl = useServerFn(createUploadUrlFn);
  const completeUpload = useServerFn(completeUploadFn);

  return useMutation({
    mutationFn: async ({
      file,
      fileType,
      parentId,
      inLibrary = true,
      onProgress,
    }: {
      file: File;
      fileType: UploadableFileType;
      parentId: string | null;
      inLibrary?: boolean;
      onProgress?: (progress: number) => void;
    }) => {
      const upload = await createUploadUrl({
        data: {
          name: file.name,
          type: fileType,
          contentType: file.type,
          size: file.size,
          parentId,
        },
      });

      await uploadFileToPresignedUrl({
        file,
        uploadUrl: upload.uploadUrl,
        contentType: upload.contentType,
        onProgress,
      });

      const newFile = await completeUpload({
        data: {
          fileId: upload.fileId,
          fileType: upload.fileType,
          fileName: upload.fileName,
          fileExtension: upload.fileExtension,
          parentId: upload.parentId,
          inLibrary,
        },
      });
      return newFile;
    },
  });
};

export const useDeleteFile = () => {
  const removeFile = useServerFn(removeFileFn);

  return useMutation({
    mutationFn: async ({ fileId }: { fileId: string }) => {
      await removeFile({ data: { id: fileId } });
    },
    onSuccess: (_, { fileId }) => {
      const router = getRouter();
      const location = router.state.location;
      if (location.pathname === "/viewer" && location.search.fid === fileId) {
        router.navigate({
          to: "/viewer",
          search: (prev: Record<string, unknown>) => ({
            ...prev,
            fid: undefined,
          }),
        });
      }
    },
  });
};
