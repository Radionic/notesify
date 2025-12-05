import { useSetAtom } from "jotai";
import { CgClose } from "react-icons/cg";
import { VscGoToFile } from "react-icons/vsc";
import { activePreviewContextAtom, type Context } from "@/atoms/chat/contexts";
import { useChatContext } from "@/hooks/chat/use-chat-context";
import { cn } from "@/lib/utils";

interface ImageContextPreviewProps {
  context: Context;
  removable?: boolean;
  onJump: () => void;
  onPreview: () => void;
  onRemove: () => void;
}

const ImageContextPreview = ({
  context,
  removable,
  onJump,
  onPreview,
  onRemove,
}: ImageContextPreviewProps) => {
  return (
    <div className="relative w-32 h-32">
      <img
        src={context.content}
        alt="Context"
        className="border rounded w-full h-full object-contain cursor-pointer"
        onClick={onPreview}
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
  const setActivePreviewContext = useSetAtom(activePreviewContextAtom);
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
    </div>
  );
};
