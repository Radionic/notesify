import { useAtom, useAtomValue } from "jotai";
import { useMemo, useState } from "react";
import { activeChatIdAtom } from "@/atoms/chat/chats";
import { activeContextsAtom } from "@/atoms/chat/contexts";
import { activePdfIdAtom, currentPageAtomFamily } from "@/atoms/pdf/pdf-viewer";
import { selectedModelAtom } from "@/atoms/setting/providers";
import { useChatAI } from "@/hooks/chat/use-chat-ai";
import { generateId } from "@/lib/id";
import { useOpenedPdfs } from "@/queries/pdf/use-pdf";
import { AutogrowingTextarea } from "../origin-ui/autogrowing-textarea";
import { ModelSelector } from "../pdf/model-selector";
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
  const { data: openedPdfs } = useOpenedPdfs();
  const viewingPage = useAtomValue(currentPageAtomFamily(pdfId));
  const { sendMessage, stop, status, error } = useChatAI({ chatId });

  const [input, setInput] = useState<string>("");
  const isLoading = status === "submitted" || status === "streaming";
  const disableSending =
    input.length === 0 || isLoading || !!error || !selectedModel;

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
        openedPdfs,
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
      <AutogrowingTextarea
        placeholder="Ask AI..."
        defaultRows={1}
        maxRows={20}
        className="border-none shadow-none focus-visible:ring-0 p-2"
        value={input}
        onChange={(e) => setInput(e.target.value)}
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
