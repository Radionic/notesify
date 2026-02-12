import { useRef, useState } from "react";
import { useChatAI } from "@/hooks/chat/use-chat-ai";
import { useIsMobile } from "@/hooks/use-mobile";
import { ModelSelector } from "../pdf/model-selector";
import { Textarea } from "../ui/textarea";
import { AddContextButton } from "./action-button/add-context-button";
import { SendButton } from "./action-button/send-button";

export const ChatInput = ({
  chatId,
  rows = 1,
}: {
  chatId: string;
  rows?: number;
}) => {
  const {
    error,
    isStreaming,
    handleSubmit,
    stop,
    handleImageUpload,
    handlePaste,
  } = useChatAI({ chatId });
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isMobile = useIsMobile();

  const [input, setInput] = useState<string>("");
  const disableSending = input.length === 0 || isStreaming || !!error;

  const _handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStreaming) {
      stop();
      return;
    }

    if (disableSending) {
      return;
    }

    handleSubmit(input);
    setInput("");

    if (isMobile) {
      textareaRef.current?.blur();
    }
  };

  return (
    <form
      onSubmit={_handleSubmit}
      className="flex flex-col p-2 rounded-md border border-input"
    >
      <Textarea
        ref={textareaRef}
        id="ask-ai-textarea"
        placeholder="Ask anything"
        className="field-sizing-content border-none shadow-none focus-visible:ring-0 p-2 min-h-0 resize-none"
        rows={rows}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onPaste={handlePaste}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            _handleSubmit(e);
          }
        }}
        disabled={!!error}
        autoFocus={!isMobile}
      />
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center gap-1">
          <AddContextButton onFileSelect={handleImageUpload} />
        </div>
        <div className="flex flex-row items-center gap-1">
          <ModelSelector />
          <SendButton disabled={disableSending} isLoading={isStreaming} />
        </div>
      </div>
    </form>
  );
};
