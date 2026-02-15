import { useState } from "react";
import { CgClose } from "react-icons/cg";
import { VscGoToFile } from "react-icons/vsc";
import type { Context } from "@/atoms/chat/contexts";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useChatContext } from "@/hooks/chat/use-chat-context";
import { cn } from "@/lib/utils";

const ImageContextPreview = ({
  context,
  removable,
  onJump,
  onPreview,
  onRemove,
}: {
  context: Context;
  removable?: boolean;
  onJump: () => void;
  onPreview: () => void;
  onRemove: () => void;
}) => {
  return (
    <div className="relative w-32 h-32">
      <img
        src={context.content}
        alt="Context"
        className="border rounded w-full h-full object-contain cursor-pointer"
        onPointerDown={onPreview}
      />
      <div className="absolute top-1 right-1 flex flex-row gap-1 opacity-50 bg-white/80 rounded p-0.5">
        {context.type !== "uploaded-image" && (
          <VscGoToFile className="cursor-pointer w-3 h-3" onClick={onJump} />
        )}
        {removable && (
          <CgClose className="cursor-pointer w-3 h-3" onClick={onRemove} />
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
  const { jumpToContext, removeContext } = useChatContext();
  const [activePreviewContext, setActivePreviewContext] = useState<Context>();
  const validContexts = contexts?.filter(
    (context) =>
      context.type === "area" ||
      context.type === "page" ||
      context.type === "uploaded-image",
  );

  if (!validContexts || validContexts.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {validContexts.map((context: Context) => (
        <ImageContextPreview
          key={context.id}
          context={context}
          removable={removable}
          onJump={() => {
            if (context.pdfId && context.page) {
              jumpToContext(context);
            }
          }}
          onPreview={() => setActivePreviewContext(context)}
          onRemove={() => removeContext(context.id)}
        />
      ))}
      <Dialog
        open={
          activePreviewContext?.type === "area" ||
          activePreviewContext?.type === "page" ||
          activePreviewContext?.type === "uploaded-image"
        }
        onOpenChange={() => setActivePreviewContext(undefined)}
      >
        <DialogContent className="max-w-3xl">
          {activePreviewContext?.content && (
            <img
              src={activePreviewContext.content}
              alt="Context Preview"
              className="w-full object-contain max-h-[80vh]"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
