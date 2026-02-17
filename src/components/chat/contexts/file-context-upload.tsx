import { useMutationState } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { CircularProgress } from "@/components/ui/circular-progress";
import { useUploadImageContext } from "@/queries/chat/use-image-context-upload";

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
  const { mutateAsync: uploadImage, progress } = useUploadImageContext({
    mutationKey: uploadKey,
  });

  // https://github.com/TanStack/query/issues/9068#issuecomment-2831997048
  const mutationStates = useMutationState({
    filters: {
      mutationKey: ["upload-context", uploadKey],
      exact: true,
    },
    select: (mutation) => ({
      status: mutation.state.status,
      error: mutation.state.error,
    }),
  });
  const { status, error } = mutationStates?.[0] ?? {
    status: "idle",
    error: null,
  };

  useEffect(() => {
    if (uploadStartedRef.current) {
      return;
    }

    uploadStartedRef.current = true;

    const upload = async () => {
      try {
        await uploadImage({ file });
      } finally {
        onSettled?.(uploadKey);
      }
    };

    void upload();
  }, [file, onSettled, uploadImage, uploadKey]);

  if (status === "idle") {
    return null;
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
