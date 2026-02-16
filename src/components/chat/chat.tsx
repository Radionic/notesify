import { useAtomValue } from "jotai";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { activeContextsAtom } from "@/atoms/chat/contexts";
import { useChatAI } from "@/hooks/chat/use-chat-ai";
import { useUploadImageContext } from "@/hooks/chat/use-image-context-upload";
import { cn } from "@/lib/utils";
import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { ChatMessageList } from "./chat-message-list";
import { ImageContextsPreview } from "./contexts/image-context-preview";
import { ImageUploadPlaceholders } from "./contexts/image-upload-placeholder";
import { TextContextsPreview } from "./contexts/text-content-preview";
import { ThreadFinder } from "./threads/thread-finder";

const ChatBranding = ({
  chatId,
  className,
}: {
  chatId?: string;
  className?: string;
}) => {
  const { messages, isLoadingMessages } = useChatAI({ chatId });
  if (messages.length > 0 || isLoadingMessages) return null;

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <img
        src="/favicon.png"
        alt="Notesify Icon"
        className="w-10 h-10 rounded-sm"
      />
      <span className="font-ebg text-2xl">Notesify AI</span>
    </div>
  );
};

export const Chat = ({
  chatId,
  onChatIdChange,
  isCentered,
  minimal,
}: {
  chatId?: string;
  onChatIdChange: (chatId?: string) => void;
  isCentered?: boolean;
  minimal?: boolean;
}) => {
  const [threadFinderOpen, setThreadFinderOpen] = useState(false);
  const contexts = useAtomValue(activeContextsAtom);
  const { handleImageUpload } = useUploadImageContext();

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

  if (isCentered) {
    return (
      <div
        {...getRootProps()}
        className="flex flex-col items-center justify-center h-full w-full bg-panel relative"
      >
        <input {...getInputProps()} />
        <ChatBranding className="justify-center mb-6" />
        <div className="w-full max-w-2xl space-y-2 px-4">
          <ImageUploadPlaceholders />
          <ImageContextsPreview contexts={contexts} removable />
          <TextContextsPreview contexts={contexts} removable />
          <ChatInput chatId={chatId} rows={3} isDragging={isDragActive} />
        </div>
      </div>
    );
  }

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
      className="flex flex-col justify-between gap-1 h-full w-full bg-panel relative"
    >
      <input {...getInputProps()} />
      <div className="flex flex-col grow min-h-0 w-full">
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
          {/* <ChatGuide chatId={chatId} /> */}
          <div className="space-y-2 flex-none p-2">
            <ImageUploadPlaceholders />
            <ImageContextsPreview contexts={contexts} removable />
            <TextContextsPreview contexts={contexts} removable />
            <ChatInput chatId={chatId} isDragging={isDragActive} />
          </div>
        </div>
      </div>
    </div>
  );
};
