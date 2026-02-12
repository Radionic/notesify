import { useAtomValue } from "jotai";
import { useState } from "react";
import { activeContextsAtom } from "@/atoms/chat/contexts";
import { generateId } from "@/lib/id";
import { ChatGuide } from "./chat-guide";
import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { ChatMessageList } from "./chat-message-list";
import { ImageContextsPreview } from "./contexts/image-context-preview";
import { TextContextsPreview } from "./contexts/text-content-preview";
import { ThreadFinder } from "./threads/thread-finder";

export const Chat = ({
  chatId,
  onChatIdChange,
  isCentered,
}: {
  chatId: string;
  onChatIdChange: (chatId: string) => void;
  isCentered?: boolean;
}) => {
  const [threadFinderOpen, setThreadFinderOpen] = useState(false);
  const contexts = useAtomValue(activeContextsAtom);

  if (isCentered) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-panel">
        <div className="flex items-center gap-4 mb-6">
          <img
            src="/favicon.png"
            alt="Notesify Icon"
            className="w-10 h-10 rounded-sm"
          />
          <span className="font-ebg text-2xl">Notesify AI</span>
        </div>
        <div className="w-full max-w-2xl space-y-2 px-4">
          <TextContextsPreview contexts={contexts} removable />
          <ImageContextsPreview contexts={contexts} removable />
          <ChatInput chatId={chatId} rows={3} />
        </div>
      </div>
    );
  }

  if (threadFinderOpen) {
    return (
      <ThreadFinder
        chatId={chatId}
        onBack={() => setThreadFinderOpen(false)}
        onSelectChat={(chatId) => {
          onChatIdChange(chatId);
          setThreadFinderOpen(false);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col justify-between gap-1 h-full w-full bg-panel">
      <ChatHeader
        chatId={chatId}
        onNewThread={() => onChatIdChange(generateId())}
        onOpenHistory={() => setThreadFinderOpen(true)}
      />
      <ChatMessageList chatId={chatId} />
      <ChatGuide chatId={chatId} />
      <div className="space-y-2 flex-none p-2">
        <TextContextsPreview contexts={contexts} removable />
        <ImageContextsPreview contexts={contexts} removable />
        <ChatInput chatId={chatId} />
      </div>
    </div>
  );
};
