import { CgClose } from "react-icons/cg";
import { VscGoToFile } from "react-icons/vsc";
import type { Context, TextContext } from "@/atoms/chat/contexts";
import { useChatContext } from "@/hooks/chat/use-chat-context";
import { cn } from "@/lib/utils";

const TextContextPreview = ({
  context,
  removable,
  onJump,
  onRemove,
}: {
  context: TextContext;
  removable?: boolean;
  onJump: () => void;
  onRemove: () => void;
}) => {
  return (
    <div className="flex flex-row justify-between items-center">
      <blockquote className="border-l-2 pl-2 italic line-clamp-2">
        {context.content}
      </blockquote>
      <div className="flex flex-row gap-1 opacity-50">
        <VscGoToFile
          className="cursor-pointer min-w-4 min-h-4"
          onClick={onJump}
        />
        {removable && (
          <CgClose
            className="cursor-pointer min-w-4 min-h-4"
            onClick={onRemove}
          />
        )}
      </div>
    </div>
  );
};

export const TextContextsPreview = ({
  contexts,
  removable,
  className,
}: {
  contexts?: Context[];
  removable?: boolean;
  className?: string;
}) => {
  const { jumpToContext, removeContext } = useChatContext();
  const textContexts = contexts?.filter((context) => context.type === "text");
  if (!textContexts || textContexts.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {textContexts.map((context) => (
        <TextContextPreview
          key={context.id}
          context={context}
          removable={removable}
          onJump={() => jumpToContext(context)}
          onRemove={() => removeContext(context.id)}
        />
      ))}
    </div>
  );
};
