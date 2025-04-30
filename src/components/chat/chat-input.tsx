import { useAtomValue } from "jotai";

import { AutogrowingTextarea } from "@/components/origin-ui/inputs";

import { SelectAreaContextButton } from "./action-button/select-context-button";
import { SendButton } from "./action-button/send-button";
import { ModelSelector } from "../pdf/model-selector";
import { useChatAI } from "@/hooks/chat/use-chat-ai";
import { activeContextsAtom } from "@/atoms/chat/contexts";
import { activeChatIdAtom } from "@/atoms/chat/chats";
import { activePdfIdAtom } from "@/atoms/pdf/pdf-viewer";
import { generateId } from "@/lib/id";
import { getSelectedModelAtom } from "@/actions/setting/providers";
import { useAction } from "@/hooks/state/use-action";

export const ChatInput = () => {
  const [getModel] = useAction(getSelectedModelAtom);
  const contexts = useAtomValue(activeContextsAtom);
  const pdfId = useAtomValue(activePdfIdAtom);
  const chatId = useAtomValue(activeChatIdAtom);
  const { input, setInput, handleInputChange, append, stop, status } = useChatAI({
    chatId,
    pdfId,
  });
  const isLoading = status === "submitted" || status === "streaming";
  const disableSending = input.length === 0 || isLoading;

  const _handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) {
      stop();
      return;
    }
    if (disableSending) {
      return;
    }

    const customModel = await getModel("Chat");
    if (!customModel) {
      return;
    }

    const id = generateId();
    const createdAt = new Date();
    append({
      id,
      createdAt,
      role: "user",
      content: input,
      data: JSON.stringify({
        modelId: customModel.modelId,
        contexts,
      }),
    });
    setInput("");
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
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            _handleSubmit(e);
          }
        }}
        autoFocus
      />
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row">
          <ModelSelector variant="button" showModelName />
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
