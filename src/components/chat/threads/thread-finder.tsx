import { useState } from "react";

import { useChats } from "@/queries/chat/use-chat";

import { ThreadHeader } from "./thread-header";
import { ThreadList } from "./thread-list";
import { ThreadSearch } from "./thread-search";

export const ThreadFinder = ({
  chatId,
  onBack,
  onSelectChat,
}: {
  chatId?: string;
  onBack: () => void;
  onSelectChat: (chatId: string) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: chatrooms, isLoading } = useChats({ searchTerm });

  return (
    <div className="w-full max-w-3xl mx-auto h-dvh p-2 space-y-2 overflow-y-auto">
      <ThreadHeader chatId={chatId} onBack={onBack} />
      <ThreadSearch searchTerm={searchTerm} onSearch={setSearchTerm} />
      <ThreadList
        chatrooms={chatrooms}
        isLoading={isLoading}
        chatId={chatId}
        onSelectChat={onSelectChat}
      />
    </div>
  );
};
