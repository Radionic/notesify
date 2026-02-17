import { useAtomValue } from "jotai";
import { useState } from "react";
import type { Context, ImageContext } from "@/atoms/chat/contexts";
import { uploadingIdsAtom } from "@/atoms/upload";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { FileUploadPlaceholder } from "./file-upload-placeholder";
import { ContextImage, ImageContextPreview } from "./image-context-preview";

export const FileContextsPreview = ({
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
  const uploadingIds = useAtomValue(uploadingIdsAtom);
  const hasContent =
    (imageContexts && imageContexts.length > 0) || uploadingIds.length > 0;

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
        {uploadingIds.map((uploadId) => (
          <FileUploadPlaceholder key={uploadId} uploadId={uploadId} />
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
