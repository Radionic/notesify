import { useAtom } from "jotai";

import { activePreviewContextAtom } from "@/atoms/chat/contexts";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export const PreviewImageDialog = () => {
  const [activePreviewContext, setActivePreviewContext] = useAtom(
    activePreviewContextAtom,
  );
  if (!activePreviewContext) return null;

  return (
    <Dialog
      open={
        activePreviewContext?.type === "area" ||
        activePreviewContext?.type === "page" ||
        activePreviewContext?.type === "uploaded-image"
      }
      onOpenChange={() => setActivePreviewContext(undefined)}
    >
      <DialogContent
        className="max-w-3xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {activePreviewContext?.content && (
          <img
            src={activePreviewContext.content}
            alt="Context Preview"
            className="w-full object-contain max-h-[80vh]"
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
