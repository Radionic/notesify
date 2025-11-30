import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { UIMessage } from "ai";
import { toast } from "sonner";
import type { Chat } from "@/db/schema/chat/chats";
import { getTextFromMessage } from "@/lib/ai/get-text-from-message";
import { generateTitleFn } from "@/server/ai/generate-title";
import { getChatFn, getChatsFn } from "@/server/chat";

export const useChat = ({ id }: { id: string }) => {
  const getChat = useServerFn(getChatFn);
  return useQuery({
    queryKey: ["chats", id],
    queryFn: () => getChat({ data: { id } }),
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

export const useUpdateChatTitle = () => {
  const queryClient = useQueryClient();
  const generateTitle = useServerFn(generateTitleFn);

  return useMutation({
    mutationFn: async ({
      chatId,
      messages,
    }: {
      chatId: string;
      messages: UIMessage[];
    }) => {
      let text = "";
      for (const message of messages) {
        const content = getTextFromMessage(message);
        if (message.role === "user") {
          text += `User: ${content}\n`;
        } else if (message.role === "assistant" && content) {
          text += `AI: ${content}\n`;
        }
        if (text.length > 512) {
          text = text.slice(0, 512);
          break;
        }
      }

      const title = await generateTitle({ data: { chatId, text } });
      return title;
    },
    onSuccess: (title, { chatId }) => {
      queryClient.setQueryData<Chat>(["chats", chatId], (oldData) => {
        if (!oldData) {
          toast.error("Chat not found");
          return;
        }
        return { ...oldData, title };
      });
      queryClient.setQueryData<Chat[]>(["chats"], (oldData) => {
        if (!oldData) {
          toast.error("Chats not found");
          return;
        }
        return oldData.map((chat) =>
          chat.id === chatId ? { ...chat, title } : chat,
        );
      });
    },
  });
};
