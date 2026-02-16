import { useAtomValue } from "jotai";
import { uploadingIdsAtom } from "@/atoms/upload";
import { useUploadStatus } from "@/hooks/upload/use-upload-status";

export const ImageUploadPlaceholder = ({ uploadId }: { uploadId: string }) => {
  const { status } = useUploadStatus(uploadId);
  if (!status || status.status !== "uploading") return null;

  const progress = status.progress ?? 0;
  const progressDeg = (progress / 100) * 360;
  const uploadRingBackground = `conic-gradient(hsl(var(--primary)) ${progressDeg}deg, hsl(var(--muted)) 0deg)`;

  return (
    <div className="relative h-20 w-20 rounded border border-border bg-background flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="h-16 w-16 rounded-full"
          style={{
            background: uploadRingBackground,
          }}
        >
          <div className="m-[3px] h-[58px] w-[58px] rounded-full bg-background" />
        </div>
      </div>
    </div>
  );
};

export const ImageUploadPlaceholders = () => {
  const uploadingImageIds = useAtomValue(uploadingIdsAtom);
  if (uploadingImageIds.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {uploadingImageIds.map((uploadId) => (
        <ImageUploadPlaceholder key={uploadId} uploadId={uploadId} />
      ))}
    </div>
  );
};
