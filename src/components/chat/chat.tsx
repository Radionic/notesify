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

export const Chat = () => {
  const [chatId, setChatId] = useState(() => generateId());
  const [threadFinderOpen, setThreadFinderOpen] = useState(false);
  const contexts = useAtomValue(activeContextsAtom);

  return threadFinderOpen ? (
    <ThreadFinder
      chatId={chatId}
      onBack={() => setThreadFinderOpen(false)}
      onSelectChat={(chatId) => {
        setChatId(chatId);
        setThreadFinderOpen(false);
      }}
    />
  ) : (
    <div className="flex flex-col justify-between gap-1 h-full w-full bg-panel">
      <ChatHeader
        chatId={chatId}
        onNewThread={() => setChatId(generateId())}
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
