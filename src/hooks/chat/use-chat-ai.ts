import { useChat } from "@ai-sdk/react";
import type { DynamicToolUIPart } from "ai";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { chatInstanceAtomFamily, pendingChatIdAtom } from "@/atoms/chat/chats";
import { activeContextsAtom } from "@/atoms/chat/contexts";
import {
  activePdfIdAtom,
  currentPageAtomFamily,
  openedPdfIdsAtom,
} from "@/atoms/pdf/pdf-viewer";
import { selectedModelAtom } from "@/atoms/setting/providers";
import { ensureVisionModel } from "@/lib/ai/ensure-vision-model";
import { generateId } from "@/lib/id";
import { useMessages } from "@/queries/chat/use-messages";
import { getRouter } from "@/router";
import type { MyUIMessage } from "@/routes/api/ai";

export const useChatAI = ({ chatId }: { chatId?: string }) => {
  const [pendingChatId, setPendingChatId] = useAtom(pendingChatIdAtom);
  const effectiveChatId = chatId ?? pendingChatId;

  const { data: initialMessages, isLoading: isLoadingMessages } =
    useMessages(chatId);
  const chat = useAtomValue(chatInstanceAtomFamily(effectiveChatId));

  const [contexts, setContexts] = useAtom(activeContextsAtom);
  const selectedModel = useAtomValue(selectedModelAtom);
  const pdfId = useAtomValue(activePdfIdAtom);
  const openedPdfIds = useAtomValue(openedPdfIdsAtom);
  const viewingPage = useAtomValue(currentPageAtomFamily(pdfId));

  const {
    messages,
    status,
    error,
    setMessages,
    sendMessage,
    stop,
    regenerate,
  } = useChat({
    id: effectiveChatId,
    chat,
  });

  useEffect(() => {
    if (
      initialMessages &&
      (initialMessages as MyUIMessage[]).length > 0 &&
      messages.length === 0
    ) {
      setMessages(initialMessages as MyUIMessage[]);
    }
  }, [initialMessages, messages, setMessages]);

  const isStreaming = status === "submitted" || status === "streaming";

  const lastMessage = messages[messages.length - 1];
  const lastPart = lastMessage?.parts?.[lastMessage?.parts.length - 1];
  const isRunningTool =
    lastPart?.type === "dynamic-tool" && lastPart?.state === "input-streaming";

  const handleSubmit = (text: string) => {
    if (!selectedModel) return;

    const hasVisionContext = contexts.some((context) =>
      ["uploaded-image", "area", "page"].includes(context.type),
    );
    if (hasVisionContext && !ensureVisionModel({ model: selectedModel })) {
      return;
    }

    sendMessage({
      text,
      metadata: {
        openedPdfIds,
        pdfId,
        viewingPage,
        contexts,
        modelId: selectedModel.id,
        chatId: effectiveChatId,
      },
    });
    setContexts([]);

    if (!chatId) {
      getRouter().navigate({
        to: "/viewer",
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          cid: effectiveChatId,
        }),
        replace: true,
      });
      setPendingChatId(generateId());
    }
  };

  const handleImageUpload = (file: File) => {
    if (!ensureVisionModel({ model: selectedModel })) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setContexts([
          ...contexts,
          {
            id: generateId(),
            type: "uploaded-image" as const,
            content: result,
          },
        ]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const { files } = e.clipboardData;
    if (!files || files.length === 0) return;

    const imageFile = Array.from(files).find((file) =>
      file.type.startsWith("image/"),
    );
    if (!imageFile) return;

    e.preventDefault();
    handleImageUpload(imageFile);
  };

  return {
    messages: messages as MyUIMessage[],
    error,
    isRunningTool,
    isLoadingMessages,
    isStreaming,
    contexts,
    sendMessage,
    stop,
    regenerate,
    handleSubmit,
    handleImageUpload,
    handlePaste,
  };
};

export const useShowChatLoading = ({
  messages,
  isStreaming,
}: {
  messages: MyUIMessage[];
  isStreaming: boolean;
}) => {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (!isStreaming || messages.length === 0) {
      setShowLoading(false);
      return;
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "assistant") {
      setShowLoading(false);
      return;
    }

    if (lastMessage.parts?.length === 0) {
      setShowLoading(true);
      return;
    }

    const parts = lastMessage.parts ?? [];
    const lastPart = parts[parts.length - 1] as DynamicToolUIPart | undefined;
    const isToolPart = lastPart?.type.startsWith("tool-");
    const toolState = lastPart?.state;
    const isToolFinished =
      isToolPart &&
      (toolState === "output-available" || toolState === "output-error");

    const shouldWaitForThreeSeconds = isToolFinished && isStreaming;
    if (!shouldWaitForThreeSeconds) {
      setShowLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setShowLoading(true);
    }, 3000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [messages, isStreaming]);

  return showLoading;
};
