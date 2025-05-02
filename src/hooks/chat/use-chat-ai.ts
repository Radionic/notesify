import { currentPageAtomFamily } from "@/atoms/pdf/pdf-viewer";
import { buildMessages, buildSystemMessage } from "@/lib/chat/chat";
import { createDataStreamResponse, Message, streamText } from "ai";
import { useChat } from "@ai-sdk/react";
import { useAtomValue } from "jotai";
import { getSelectedModelAtom } from "@/actions/setting/providers";
import { useAction } from "../state/use-action";
import { tools } from "@/lib/chat/tools";
import { useMessages, useSaveMessage } from "@/queries/chat/use-messages";
import { useOpenedPdfs } from "@/queries/pdf/use-pdf";

export const useChatAI = ({
  chatId,
  pdfId,
}: {
  chatId: string;
  pdfId?: string;
}) => {
  const [getModel] = useAction(getSelectedModelAtom);
  const viewingPage = useAtomValue(currentPageAtomFamily(pdfId));
  const { data: initialMessages } = useMessages(chatId);
  const { data: openedPdfs } = useOpenedPdfs();
  const { mutate: saveMessage } = useSaveMessage();

  return useChat({
    id: chatId,
    // api: import.meta.env.VITE_CHAT_ENDPOINT,
    maxSteps: 10,
    sendExtraMessageFields: true,
    initialMessages: initialMessages as Message[],
    fetch: async (input, init) => {
      const model = await getModel("Chat");
      if (!model) {
        throw new Error("Please provide API key and select a model");
      }

      const body = JSON.parse(init?.body?.toString() ?? "{}");
      const { messages } = body;
      const lastMessage = messages[messages.length - 1];
      const data = JSON.parse(lastMessage.data ?? "{}");

      if (lastMessage.role === "user") {
        const userMessage = {
          ...lastMessage,
          chatId,
          createdAt: new Date(lastMessage.createdAt),
          role: "user",
          annotations: null,
        };
        console.log("Saving user message", userMessage);
        await saveMessage(userMessage);
      }

      const system = buildSystemMessage(openedPdfs, pdfId, viewingPage);
      const messagesWithContext = buildMessages(messages, data?.contexts);

      return await createDataStreamResponse({
        execute: (dataStream) => {
          dataStream.writeMessageAnnotation({
            modelId: model.modelId,
          });
          const res = streamText({
            model,
            system,
            messages: messagesWithContext as any,
            tools,
            toolCallStreaming: true,
            abortSignal: init?.signal || undefined,
          });
          res.mergeIntoDataStream(dataStream);
        },
      });
    },
    onFinish: async (message) => {
      const aiMessage = {
        ...message,
        chatId,
        createdAt: message.createdAt ?? new Date(),
        data: null,
        annotations: message.annotations ?? null,
        parts: message.parts,
      };
      console.log("Saving AI message", aiMessage);
      await saveMessage(aiMessage);
    },
  });
};
