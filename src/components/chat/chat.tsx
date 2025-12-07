import { useAtomValue } from "jotai";
import { threadFinderOpenAtom } from "@/atoms/chat/chats";
import { activeContextsAtom } from "@/atoms/chat/contexts";
import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { ChatMessageList } from "./chat-message-list";
import { ImageContextsPreview } from "./contexts/image-context-preview";
import { TextContextsPreview } from "./contexts/text-content-preview";
import { ThreadFinder } from "./threads/thread-finder";

// import { Message } from "ai";
// const messages: Message[] = [
//   {
//     id: "1",
//     role: "assistant",
//     content: "```thinking\n123\n```",
//     createdAt: new Date(),
//   },
// ];

export const Chat = () => {
  const threadFinderOpen = useAtomValue(threadFinderOpenAtom);
  const contexts = useAtomValue(activeContextsAtom);

  return threadFinderOpen ? (
    <ThreadFinder />
  ) : (
    <div className="flex flex-col justify-between gap-1 h-full w-full bg-panel">
      <ChatHeader />
      <ChatMessageList />
      <div className="space-y-2 flex-none p-2">
        <TextContextsPreview contexts={contexts} removable />
        <ImageContextsPreview contexts={contexts} removable />
        <ChatInput />
      </div>
    </div>
  );
};
