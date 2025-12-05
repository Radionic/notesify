import { useAtom, useAtomValue } from "jotai";
import { useMemo, useState } from "react";
import { activeChatIdAtom } from "@/atoms/chat/chats";
import { activeContextsAtom } from "@/atoms/chat/contexts";
import {
  activePdfIdAtom,
  currentPageAtomFamily,
  openedPdfIdsAtom,
} from "@/atoms/pdf/pdf-viewer";
import { selectedModelAtom } from "@/atoms/setting/providers";
import { useChatAI } from "@/hooks/chat/use-chat-ai";
import { generateId } from "@/lib/id";
import { ModelSelector } from "../pdf/model-selector";
import { Textarea } from "../ui/textarea";
import { SelectAreaContextButton } from "./action-button/select-context-button";
import { SendButton } from "./action-button/send-button";

export const ChatInput = () => {
  const [contexts, setContexts] = useAtom(activeContextsAtom);
  const pdfId = useAtomValue(activePdfIdAtom);
  const [activeChatId, setActiveChatId] = useAtom(activeChatIdAtom);
  const chatId = useMemo(
    () => (activeChatId ? activeChatId : generateId()),
    [activeChatId],
  );

  const selectedModel = useAtomValue(selectedModelAtom);
  const openedPdfIds = useAtomValue(openedPdfIdsAtom);
  const viewingPage = useAtomValue(currentPageAtomFamily(pdfId));
  const { sendMessage, stop, status, error } = useChatAI({ chatId });

  const [input, setInput] = useState<string>("");
  const isLoading = status === "submitted" || status === "streaming";
  const disableSending =
    input.length === 0 || isLoading || !!error || !selectedModel;

  const _handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const { files } = e.clipboardData;
    if (!files || files.length === 0) {
      return;
    }

    const imageFile = Array.from(files).find((file) =>
      file.type.startsWith("image/"),
    );

    if (!imageFile) {
      return;
    }

    e.preventDefault();

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setContexts([
          ...contexts,
          {
            id: generateId(),
            type: "uploaded-image",
            content: result,
          },
        ]);
      }
    };
    reader.readAsDataURL(imageFile);
  };

  const _handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) {
      stop();
      return;
    }
    if (disableSending) {
      return;
    }

    sendMessage({
      text: input,
      metadata: {
        openedPdfIds,
        pdfId,
        viewingPage,
        contexts,
        modelId: selectedModel.id,
        chatId,
      },
    });
    setActiveChatId(chatId);
    setInput("");
    setContexts([]);
  };

  return (
    <form
      onSubmit={_handleSubmit}
      className="flex flex-col p-2 rounded-md border border-input"
    >
      <Textarea
        id="ask-ai-textarea"
        placeholder="Ask AI..."
        className="field-sizing-content border-none shadow-none focus-visible:ring-0 p-2 min-h-0 resize-none"
        rows={1}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onPaste={_handlePaste}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            _handleSubmit(e);
          }
        }}
        disabled={!!error}
        autoFocus
      />
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row">
          <ModelSelector />
          <SelectAreaContextButton />
        </div>
        <div className="flex flex-row items-center">
          {/* <ResponseQualityButton /> */}
          <SendButton disabled={disableSending} isLoading={isLoading} />
        </div>
      </div>
    </form>
  );
};
