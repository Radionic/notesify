import { getSelectedModelAtom } from "@/actions/setting/providers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Message } from "ai";
import { useSetAtom } from "jotai";
import { createChat, updateChatTitle } from "@/lib/db/chat";
import { generateTitle } from "@/lib/chat/chat";
import { activeChatIdAtom } from "@/atoms/chat/chats";
import { Chat } from "@/db/schema/chat/chats";
import { toast } from "sonner";
import { dbService } from "@/lib/db";

export const useChat = ({ id }: { id: string }) => {
  return useQuery({
    queryKey: ["chats", id],
    queryFn: () => dbService.chat.getChat({ id }),
  });
};

export const useChats = ({ searchTerm }: { searchTerm?: string }) => {
  return useQuery({
    queryKey: ["chats", searchTerm],
    queryFn: () => dbService.chat.getChats({ searchTerm }),
  });
};

export const useCreateNewChat = () => {
  const queryClient = useQueryClient();
  const setActiveChatId = useSetAtom(activeChatIdAtom);

  return useMutation({
    mutationFn: async () => {
      const chat = await createChat();
      console.log("Created new chat", chat.id);
      setActiveChatId(chat.id);
      return chat;
    },
    onSuccess: (newChat) => {
      queryClient.setQueryData<Chat[]>(["chats"], (oldData) => {
        if (!oldData) {
          return [newChat];
        }
        return [...oldData, newChat];
      });
    },
  });
};

export const useUpdateChatTitle = () => {
  const queryClient = useQueryClient();
  const getModel = useSetAtom(getSelectedModelAtom);

  return useMutation({
    mutationFn: async ({
      chatId,
      messages,
    }: {
      chatId: string;
      messages: Message[];
    }) => {
      const model = getModel("Chat");
      const title = await generateTitle(model, messages);
      await updateChatTitle(chatId, title);
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
          chat.id === chatId ? { ...chat, title } : chat
        );
      });
    },
  });
};
