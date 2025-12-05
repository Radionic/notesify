import { convertToModelMessages, type ModelMessage, type UIMessage } from "ai";
import type { Context } from "@/atoms/chat/contexts";
import { getTextFromMessage } from "./get-text-from-message";

const buildTextContent = (content: string, contexts?: Context[]) => {
  const textContext = contexts
    ?.filter((c) => c.type === "text")
    .map((c) => c.content)
    .join("\n\n");
  return {
    type: "text" as const,
    text: textContext
      ? `${content}\n<user_selected_text>:\n${textContext}\n</user_selected_text>`
      : content,
  };
};

const buildImageContent = (contexts?: Context[]) => {
  return (
    contexts
      ?.filter(
        (c) =>
          c.type === "page" || c.type === "area" || c.type === "uploaded-image",
      )
      .map((c) => ({
        type: "image" as const,
        image: c.content || "",
      })) || []
  );
};

export const buildMessages = (
  messages: UIMessage[],
  contexts?: Context[],
): ModelMessage[] => {
  const currentMessage = messages[messages.length - 1];
  if (currentMessage.role !== "user") {
    return convertToModelMessages(messages);
  }
  const initialMessages = messages.slice(0, -1);

  const textContent = buildTextContent(
    getTextFromMessage(currentMessage),
    contexts,
  );
  const imageContent = buildImageContent(contexts);
  return [
    ...convertToModelMessages(initialMessages),
    {
      role: "user",
      content: [textContent, ...imageContent].filter(Boolean),
    } as ModelMessage,
  ];
};
