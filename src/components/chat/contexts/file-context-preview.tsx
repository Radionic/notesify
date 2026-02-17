import { useState } from "react";
import type { Context, ImageContext } from "@/atoms/chat/contexts";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { FileContextUpload } from "./file-context-upload";
import { ContextImage, ImageContextPreview } from "./image-context-preview";

export const FileContextsPreview = ({
  contexts,
  removable,
  className,
  uploadingQueue = [],
  onUploadSettled,
}: {
  contexts?: Context[];
  removable?: boolean;
  className?: string;
  uploadingQueue?: { id: string; file: File }[];
  onUploadSettled?: (id: string) => void;
}) => {
  const [activePreviewContext, setActivePreviewContext] =
    useState<ImageContext>();
  const imageContexts = contexts?.filter((context) => context.type === "image");
  const hasContent =
    (imageContexts && imageContexts.length > 0) || uploadingQueue.length > 0;

  if (!hasContent) return null;

  return (
    <>
      <div className={cn("flex flex-wrap gap-2", className)}>
        {imageContexts?.map((context) => (
          <ImageContextPreview
            key={context.fileId}
            context={context}
            removable={removable}
            onPreview={() => setActivePreviewContext(context)}
          />
        ))}
        {uploadingQueue.map((item) => (
          <FileContextUpload
            key={item.id}
            uploadKey={item.id}
            file={item.file}
            onSettled={onUploadSettled}
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
              className="w-full object-contain max-h-[90vh] rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
