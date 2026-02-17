import { useAtomValue } from "jotai";
import { type ClipboardEvent, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { activeContextsAtom } from "@/atoms/chat/contexts";
import { selectedModelAtom } from "@/atoms/setting/providers";
import { ensureVisionModel } from "@/lib/ai/ensure-vision-model";
import { generateId } from "@/lib/id";
import { cn } from "@/lib/utils";
import { ChatBranding } from "./chat-branding";
import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { ChatMessageList } from "./chat-message-list";
import { FileContextsPreview } from "./contexts/file-context-preview";
import { TextContextsPreview } from "./contexts/text-context-preview";
import { ThreadFinder } from "./threads/thread-finder";

export const Chat = ({
  chatId,
  onChatIdChange,
  centered,
  minimal,
}: {
  chatId?: string;
  onChatIdChange: (chatId?: string) => void;
  centered?: boolean;
  minimal?: boolean;
}) => {
  const [threadFinderOpen, setThreadFinderOpen] = useState(false);
  const contexts = useAtomValue(activeContextsAtom);
  const selectedModel = useAtomValue(selectedModelAtom);
  const [queue, setQueue] = useState<{ id: string; file: File }[]>([]);

  const handleImageUpload = useCallback(
    (file: File) => {
      if (!ensureVisionModel({ model: selectedModel })) return;

      setQueue((prev) => [...prev, { id: generateId(), file }]);
    },
    [selectedModel],
  );

  const handlePasteImage = useCallback(
    (e: ClipboardEvent<HTMLTextAreaElement>) => {
      const { files } = e.clipboardData;
      if (!files || files.length === 0) return;

      const imageFile = Array.from(files).find((file) =>
        file.type.startsWith("image/"),
      );
      if (!imageFile) return;

      e.preventDefault();
      handleImageUpload(imageFile);
    },
    [handleImageUpload],
  );

  const removeQueueItem = useCallback((id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      for (const file of acceptedFiles) {
        if (file.type.startsWith("image/")) {
          handleImageUpload(file);
        }
      }
    },
    noClick: true,
    accept: {
      "image/*": [],
    },
  });

  if (threadFinderOpen) {
    return (
      <ThreadFinder
        chatId={chatId}
        onBack={() => setThreadFinderOpen(false)}
        onSelectChat={(chatId) => {
          onChatIdChange(chatId);
          setThreadFinderOpen(false);
        }}
      />
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col h-full w-full bg-panel relative",
        centered ? "items-center justify-center" : "justify-between gap-1",
      )}
    >
      <input {...getInputProps()} />
      <div
        className={cn(
          "flex flex-col w-full",
          centered ? "max-w-2xl space-y-2 px-4" : "grow min-h-0",
        )}
      >
        {centered ? (
          <ChatBranding className="justify-center mb-6" />
        ) : (
          <>
            <div className={cn("w-full", minimal && "max-w-3xl mx-auto")}>
              <ChatHeader
                chatId={chatId}
                onNewThread={() => onChatIdChange(undefined)}
                onOpenHistory={() => setThreadFinderOpen(true)}
                minimal={minimal}
              />
            </div>
            <div className="flex flex-col grow min-h-0 w-full max-w-3xl mx-auto">
              <ChatMessageList chatId={chatId} />
              <ChatBranding
                chatId={chatId}
                className="flex grow items-center justify-center"
              />
            </div>
          </>
        )}
        <div
          className={cn(
            "w-full max-w-3xl mx-auto space-y-2",
            !centered && "flex-none p-2",
          )}
        >
          <FileContextsPreview
            contexts={contexts}
            uploadingQueue={queue}
            onUploadSettled={removeQueueItem}
            removable
          />
          <TextContextsPreview contexts={contexts} removable />
          <ChatInput
            chatId={chatId}
            rows={centered ? 3 : undefined}
            isDragging={isDragActive}
            onImageUpload={handleImageUpload}
            onImagePaste={handlePasteImage}
          />
        </div>
      </div>
    </div>
  );
};
