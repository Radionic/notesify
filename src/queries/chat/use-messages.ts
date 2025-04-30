import { getMessage, getMessages, saveMessage } from "@/lib/db/message";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useMessage = (id: string) => {
  return useQuery({
    queryKey: ["messages", id],
    queryFn: () => getMessage(id),
  });
};

export const useMessages = (chatId: string) => {
  return useQuery({
    queryKey: ["messages", chatId],
    queryFn: () => getMessages(chatId),
  });
};

export const useSaveMessage = () => {
  return useMutation({
    mutationFn: saveMessage,
  });
};
