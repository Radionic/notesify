import { useUploadStatus } from "@/hooks/upload/use-upload-status";

export const FileUploadPlaceholder = ({ uploadId }: { uploadId: string }) => {
  const { status } = useUploadStatus(uploadId);
  if (!status || status.status !== "uploading") return null;

  const progress = status.progress ?? 0;

  return (
    <div className="relative h-20 w-20 rounded border border-border bg-background flex items-center justify-center">
      <div className="relative h-5 w-5">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <title>Uploading file... {progress}%</title>
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="var(--muted)"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="var(--primary)"
            strokeWidth="12"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
      </div>
    </div>
  );
};
