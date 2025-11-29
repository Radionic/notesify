import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMessagesFn } from "@/server/message";

export const useMessages = (chatId: string) => {
  const getMessages = useServerFn(getMessagesFn);
  return useQuery({
    queryKey: ["messages", chatId],
    queryFn: () => getMessages({ data: { chatId } }),
  });
};
