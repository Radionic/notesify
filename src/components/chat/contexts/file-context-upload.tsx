import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { BsFiletypePdf } from "react-icons/bs";
import { CircularProgress } from "@/components/ui/circular-progress";
import { useUploadImageContext } from "@/queries/chat/use-image-context-upload";
import { useUploadPdfContext } from "@/queries/chat/use-pdf-context-upload";
import { useUploadStatus } from "@/queries/file-system/use-upload-status";

export const FileContextUpload = ({
  uploadKey,
  file,
  onSettled,
}: {
  uploadKey: string;
  file: File;
  onSettled?: (id: string) => void;
}) => {
  const uploadStartedRef = useRef(false);
  const isPdf = file.type === "application/pdf";

  const { mutateAsync: uploadImage, progress: imageProgress } =
    useUploadImageContext({ mutationKey: uploadKey });
  const { mutateAsync: uploadPdf, progress: pdfProgress } = useUploadPdfContext(
    { mutationKey: uploadKey },
  );

  // https://github.com/TanStack/query/issues/9068#issuecomment-2831997048
  const { status, error } = useUploadStatus(["upload-context", uploadKey]);
  const progress = isPdf ? pdfProgress : imageProgress;

  useEffect(() => {
    if (uploadStartedRef.current) return;
    uploadStartedRef.current = true;

    const upload = async () => {
      try {
        if (isPdf) {
          await uploadPdf({ file });
        } else {
          await uploadImage({ file });
        }
      } finally {
        onSettled?.(uploadKey);
      }
    };

    void upload();
  }, [file, isPdf, onSettled, uploadImage, uploadPdf, uploadKey]);

  if (status === "idle") return null;

  if (isPdf) {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-card px-2.5 py-1.5 max-w-48">
        <BsFiletypePdf className="h-4 w-4 shrink-0 text-blue-500" />
        <p className="truncate text-sm font-medium flex-1">{file.name}</p>
        <div className="shrink-0">
          {status === "pending" && (
            <CircularProgress progress={progress} size={14} strokeWidth={2} />
          )}
          {status === "success" && (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          )}
          {status === "error" && (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-20 w-20 rounded border border-border bg-muted/40 flex items-center justify-center">
      {status === "pending" && (
        <CircularProgress progress={progress} size={18} strokeWidth={2} />
      )}
      {status === "success" && (
        <CheckCircle2 className="h-6 w-6 text-green-500" />
      )}
      {status === "error" && (
        <AlertCircle className="h-6 w-6 text-destructive" />
      )}
      {status === "error" && error && (
        <span className="sr-only">{error.message}</span>
      )}
    </div>
  );
};
