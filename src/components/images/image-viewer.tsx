import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageToolbar } from "@/components/viewer/toolbars/image-toolbar";
import { useFileData } from "@/queries/file-system/use-file-system";

const SkeletonContent = () => (
  <div className="flex items-center justify-center h-full">
    <Skeleton className="w-3/4 h-3/4 rounded-lg" />
  </div>
);

const ErrorState = () => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="text-center space-y-4">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
        <AlertCircle className="w-6 h-6 text-destructive" />
      </div>
      <div>
        <h3 className="font-semibold">Failed to load image</h3>
      </div>
    </div>
  </div>
);

export const ImageViewer = ({ imageId }: { imageId: string }) => {
  const { data: blob, isLoading } = useFileData({
    id: imageId,
    type: "images",
  });
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) {
      setImageUrl(null);
      return;
    }

    const url = URL.createObjectURL(blob);
    setImageUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [blob]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-background">
        <ImageToolbar imageId={imageId} />
        <SkeletonContent />
      </div>
    );
  }

  if (!blob || !imageUrl) {
    return (
      <div className="flex flex-col h-full bg-background">
        <ImageToolbar imageId={imageId} />
        <ErrorState />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <ImageToolbar imageId={imageId} />
      <div className="flex-1 flex items-center justify-center bg-muted/30 p-4 overflow-auto">
        <img
          src={imageUrl}
          alt="Viewer"
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  );
};
