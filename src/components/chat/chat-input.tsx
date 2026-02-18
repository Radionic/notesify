import { useIsMutating } from "@tanstack/react-query";
import { ImagePlus } from "lucide-react";
import { useRef, useState } from "react";
import { useChatAI } from "@/hooks/chat/use-chat-ai";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ModelSelector } from "../pdf/model-selector";
import { Textarea } from "../ui/textarea";
import { AddContextButton } from "./action-button/add-context-button";
import { SendButton } from "./action-button/send-button";

export const ChatInput = ({
  chatId,
  rows = 1,
  isDragging,
  onFileUpload,
}: {
  chatId?: string;
  rows?: number;
  isDragging?: boolean;
  onFileUpload: (file: File) => void;
}) => {
  const { error, isStreaming, handleSubmit, stop } = useChatAI({ chatId });
  const hasPendingUpload =
    useIsMutating({ mutationKey: ["upload-context"] }) > 0;
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isMobile = useIsMobile();
  const [isOver, setIsOver] = useState(false);

  const [input, setInput] = useState<string>("");
  const disableSending =
    input.length === 0 || isStreaming || !!error || hasPendingUpload;

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
      className={cn(
        "flex flex-col p-2 rounded-md border border-input transition-all relative overflow-hidden",
        isDragging && "border-primary border-dashed ring-2 ring-primary/20",
        isDragging && (isOver ? "bg-primary/15" : "bg-primary/5"),
      )}
      onDragOver={(e: React.DragEvent) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragEnter={(e: React.DragEvent) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={(e: React.DragEvent) => {
        e.preventDefault();
        setIsOver(false);
      }}
      onDrop={() => setIsOver(false)}
    >
      {isDragging && <DragOverlay isOver={isOver} />}
      <div
        className={cn(
          "flex flex-col transition-all duration-200",
          isDragging && "blur-[1px] opacity-40",
        )}
      >
        <Textarea
          ref={textareaRef}
          id="ask-ai-textarea"
          placeholder="Ask anything"
          className="field-sizing-content border-none shadow-none focus-visible:ring-0 p-2 min-h-0 resize-none"
          rows={rows}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPaste={(e) => {
            const imageFile = Array.from(e.clipboardData.files).find((f) =>
              f.type.startsWith("image/"),
            );
            if (imageFile) {
              e.preventDefault();
              onFileUpload(imageFile);
            }
          }}
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
            <AddContextButton onFileSelect={onFileUpload} />
          </div>
          <div className="flex flex-row items-center gap-1">
            <ModelSelector />
            <SendButton disabled={disableSending} isLoading={isStreaming} />
          </div>
        </div>
      </div>
    </form>
  );
};

const DragOverlay = ({ isOver }: { isOver: boolean }) => (
  <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none animate-in fade-in duration-200">
    <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]" />
    <div
      className={cn(
        "relative bg-background/90 px-4 py-2 rounded-xl shadow-lg border border-primary/20 flex items-center gap-3 transition-colors",
        isOver && "border-primary/40 shadow-primary/10",
      )}
    >
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        <ImagePlus className="w-5 h-5" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-primary">
          Drop files to upload
        </span>
        <span className="text-[10px] text-muted-foreground">
          Supports images and PDFs
        </span>
      </div>
    </div>
  </div>
);
