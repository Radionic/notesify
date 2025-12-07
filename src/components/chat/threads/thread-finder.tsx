import { useState } from "react";

import { useChats } from "@/queries/chat/use-chat";

import { ThreadHeader } from "./thread-header";
import { ThreadList } from "./thread-list";
import { ThreadSearch } from "./thread-search";

export const ThreadFinder = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: chatrooms, isLoading } = useChats({ searchTerm });

  return (
    <div className="h-dvh p-2 space-y-2 overflow-y-auto">
      <ThreadHeader />
      <ThreadSearch searchTerm={searchTerm} onSearch={setSearchTerm} />
      <ThreadList chatrooms={chatrooms} isLoading={isLoading} />
    </div>
  );
};
