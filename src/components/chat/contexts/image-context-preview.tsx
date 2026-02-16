import { useMemo, useState } from "react";
import { CgClose } from "react-icons/cg";
import type { Context, ImageContext } from "@/atoms/chat/contexts";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useRemoveImageContext } from "@/hooks/chat/use-image-context-upload";
import { cn } from "@/lib/utils";
import { useFileData } from "@/queries/file-system/use-file-system";

const ContextImage = ({
  context,
  alt,
  className,
  onPointerDown,
}: {
  context: ImageContext;
  alt: string;
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
      alt={alt}
      className={className}
      onPointerDown={onPointerDown}
    />
  );
};

const ImageContextPreview = ({
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
    <div className="relative w-20 h-20">
      <ContextImage
        context={context}
        alt="Context"
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
      <div className="absolute top-1 right-1 flex flex-row gap-1 opacity-50 bg-white/80 rounded p-0.5">
        {removable && !isDeleting && (
          <CgClose
            className="cursor-pointer w-3 h-3"
            onClick={() => removeContext(context.id)}
          />
        )}
      </div>
    </div>
  );
};

export const ImageContextsPreview = ({
  contexts,
  removable,
  className,
}: {
  contexts?: Context[];
  removable?: boolean;
  className?: string;
}) => {
  const [activePreviewContext, setActivePreviewContext] =
    useState<ImageContext>();

  const imageContexts = contexts?.filter((context) => context.type === "image");
  if (!imageContexts || imageContexts.length === 0) return null;

  return (
    <>
      <div className={cn("flex flex-wrap gap-2", className)}>
        {imageContexts.map((context) => (
          <ImageContextPreview
            key={context.id}
            context={context}
            removable={removable}
            onPreview={() => setActivePreviewContext(context)}
          />
        ))}
      </div>
      <Dialog
        open={activePreviewContext?.type === "image"}
        onOpenChange={() => setActivePreviewContext(undefined)}
      >
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-none bg-transparent shadow-none">
          {activePreviewContext && (
            <ContextImage
              context={activePreviewContext}
              alt="Context Preview"
              className="w-full object-contain max-h-[90vh] rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
