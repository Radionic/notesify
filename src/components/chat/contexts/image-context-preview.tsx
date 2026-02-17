import { useMemo } from "react";
import { CgClose } from "react-icons/cg";
import type { ImageContext } from "@/atoms/chat/contexts";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useRemoveImageContext } from "@/hooks/chat/use-image-context-upload";
import { cn } from "@/lib/utils";
import { useFileData } from "@/queries/file-system/use-file-system";

export const ContextImage = ({
  context,
  className,
  onPointerDown,
}: {
  context: ImageContext;
  className?: string;
  onPointerDown?: () => void;
}) => {
  const { data, isLoading } = useFileData({
    id: context.fileId,
    type: "images",
  });

  const imageSrc = useMemo(() => {
    if (!data) return undefined;
    return URL.createObjectURL(data);
  }, [data]);

  if (isLoading && !imageSrc) {
    return (
      <div className="border rounded w-full h-full flex items-center justify-center bg-muted/40">
        <Spinner className="w-5 h-5" />
      </div>
    );
  }

  if (!imageSrc) {
    return null;
  }

  return (
    <img
      src={imageSrc}
      alt="Context"
      className={className}
      onPointerDown={onPointerDown}
    />
  );
};

export const ImageContextPreview = ({
  context,
  removable,
  onPreview,
}: {
  context: ImageContext;
  removable?: boolean;
  onPreview: () => void;
}) => {
  const { mutate: removeContext, isPending: isDeleting } =
    useRemoveImageContext();

  return (
    <div className="relative w-20 h-20 group">
      <ContextImage
        context={context}
        className={cn(
          "border rounded w-full h-full object-cover cursor-pointer",
          isDeleting && "opacity-50",
        )}
        onPointerDown={onPreview}
      />
      {isDeleting && (
        <div className="absolute inset-0 rounded bg-background/70 flex items-center justify-center">
          <Spinner />
        </div>
      )}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {removable && !isDeleting && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 bg-background/90 backdrop-blur-sm"
            onClick={() => removeContext(context.fileId)}
          >
            <CgClose className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
