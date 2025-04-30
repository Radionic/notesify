import { format, isToday, isYesterday, startOfDay } from "date-fns";
import { useMemo } from "react";
import { type Chat } from "@/db/schema/chat/chats";
import { ThreadGroup } from "./thread-group";

type GroupedChats = Record<string, Chat[]>;

const formatDateHeader = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return "Today";
  }
  if (isYesterday(date)) {
    return "Yesterday";
  }
  return format(date, "MMMM d, yyyy");
};

export const ThreadList = ({ chatrooms }: { chatrooms?: Chat[] }) => {
  // Group chats by date
  const { groupedChats, sortedDates } = useMemo(() => {
    if (!chatrooms) {
      return { groupedChats: {}, sortedDates: [] };
    }

    const grouped: GroupedChats = {};
    chatrooms.forEach((chat) => {
      const dateKey = startOfDay(chat.updatedAt).toISOString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(chat);
    });

    Object.values(grouped).forEach((group) => {
      group.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    });

    const sortedDates = Object.keys(grouped).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    return { groupedChats: grouped, sortedDates };
  }, [chatrooms]);

  if (!chatrooms || chatrooms.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        No chats found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedDates.map((dateStr) => (
        <div key={dateStr} className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground px-2">
            {formatDateHeader(dateStr)}
          </div>

          <ThreadGroup chats={groupedChats[dateStr]} />
        </div>
      ))}
    </div>
  );
};
