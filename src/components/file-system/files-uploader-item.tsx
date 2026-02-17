import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BsFiletypePdf } from "react-icons/bs";
import { CircularProgress } from "@/components/ui/circular-progress";
import { useUploadPdf } from "@/queries/file-system/use-upload-pdf";

const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

type UploadStatus = "pending" | "success" | "error";

export function FilesUploaderItem({
  file,
  parentId,
}: {
  file: File;
  parentId: string | null;
}) {
  // useMutation status isn't updating, so we need to keep track of it ourselves
  const { mutateAsync: uploadPdf } = useUploadPdf();

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UploadStatus>("pending");
  const [error, setError] = useState<Error | null>(null);

  const uploadStartedRef = useRef(false);

  const onProgressCallback = useCallback((nextProgress: number) => {
    setProgress(nextProgress);
  }, []);

  useEffect(() => {
    if (uploadStartedRef.current) {
      return;
    }

    uploadStartedRef.current = true;

    const upload = async () => {
      try {
        await uploadPdf({
          file,
          parentId,
          onProgress: onProgressCallback,
        });
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err : new Error("Upload failed"));
      }
    };

    upload();
  }, [file, parentId, uploadPdf, onProgressCallback]);

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-2.5">
      <BsFiletypePdf className="h-5 w-5 shrink-0 text-blue-500" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.size)}
        </p>
        {status === "error" && error && (
          <p className="text-xs text-destructive">{error.message}</p>
        )}
      </div>

      <div className="shrink-0">
        {status === "pending" && (
          <CircularProgress progress={progress} size={20} strokeWidth={2} />
        )}

        {status === "success" && (
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        )}

        {status === "error" && (
          <AlertCircle className="h-6 w-6 text-destructive" />
        )}
      </div>
    </div>
  );
}
