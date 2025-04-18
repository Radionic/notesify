import { useAtomValue } from "jotai";

import { activeContextsAtom } from "@/atoms/contexts";

import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { ChatMessageList } from "./chat-message-list";
import { ImageContextsPreview } from "./contexts/image-context-preview";
import { TextContextsPreview } from "./contexts/text-content-preview";
import { ThreadFinder } from "./threads/thread-finder";
import { QuickActions } from "./quick-actions/quick-actions";
import { threadFinderOpenAtom } from "@/atoms/chats";

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
    <div className="flex flex-col justify-between gap-1 h-full w-full">
      <ChatHeader />
      <ChatMessageList className="grow p-2" />
      <div className="space-y-2 flex-none p-2">
        <TextContextsPreview contexts={contexts} removable />
        <ImageContextsPreview contexts={contexts} removable />
        <QuickActions />
        <ChatInput />
      </div>
    </div>
  );
};
