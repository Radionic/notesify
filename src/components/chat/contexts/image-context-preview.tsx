import { useSetAtom } from "jotai";
import { CgClose } from "react-icons/cg";
import { VscGoToFile } from "react-icons/vsc";

import { activePreviewContextAtom, Context } from "@/atoms/chat/contexts";
import { useChatContext } from "@/hooks/chat/use-chat-context";

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
    <div className="relative">
      <img
        src={context.content}
        alt="Context"
        className="border rounded w-full aspect-square object-contain cursor-pointer"
        onClick={onPreview}
      />
      <div className="absolute top-2 right-2 flex flex-row gap-1 opacity-50">
        <VscGoToFile className="cursor-pointer" onClick={onJump} />
        {removable && <CgClose className="cursor-pointer" onClick={onRemove} />}
      </div>
    </div>
  );
};

export const ImageContextsPreview = ({
  contexts,
  removable,
}: {
  contexts?: Context[];
  removable?: boolean;
}) => {
  const { jumpToContext, removeContext } = useChatContext();
  const setActivePreviewContext = useSetAtom(activePreviewContextAtom);
  if (!contexts || contexts.length === 0) return null;
  return (
    <div className="grid grid-cols-4 gap-2">
      {contexts
        .filter((context) => context.type === "area" || context.type === "page")
        .map((context: Context) => (
          <ImageContextPreview
            key={context.id}
            context={context}
            removable={removable}
            onJump={() => jumpToContext(context)}
            onPreview={() => setActivePreviewContext(context)}
            onRemove={() => removeContext(context.id)}
          />
        ))}
    </div>
  );
};
