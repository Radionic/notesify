import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getChatFn, getChatsFn } from "@/server/chat";

export const useChat = ({ id }: { id?: string }) => {
  const getChat = useServerFn(getChatFn);
  return useQuery({
    queryKey: ["chats", id],
    queryFn: async () => {
      if (!id) {
        throw new Error("No chat id");
      }
      return await getChat({ data: { id } });
    },
    enabled: !!id,
  });
};

export const useChats = ({ searchTerm }: { searchTerm?: string }) => {
  const getChats = useServerFn(getChatsFn);
  return useQuery({
    queryKey: ["chats", searchTerm],
    queryFn: () => getChats({ data: { searchTerm } }),
  });
};
