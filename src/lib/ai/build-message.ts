import { convertToModelMessages, type ModelMessage, type UIMessage } from "ai";
import type { Context } from "@/atoms/chat/contexts";
import type { OpenedPDF } from "@/queries/pdf/use-pdf";
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
      ?.filter((c) => c.type === "page" || c.type === "area")
      .map((c) => ({
        type: "image" as const,
        image: c.content || "",
      })) || []
  );
};

export const buildSystemMessage = (
  openedPdfs?: OpenedPDF[],
  viewingPdfId?: string,
  viewingPage?: number,
) => {
  if (!openedPdfs || !viewingPdfId || !viewingPage) {
    return "You are a helpful assistant. Reply in Markdown format.";
  }

  const openedPdfsContext = openedPdfs
    .map(
      (pdf) =>
        `{ name: "${pdf.name}", id: "${pdf.id}", totalPages: ${pdf.pageCount} }`,
    )
    .join(", ");
  const viewingPdfName = openedPdfs.find(
    (pdf) => pdf.id === viewingPdfId,
  )?.name;

  const systemMessage = `You are a helpful PDF assistant. The user has opened ${openedPdfs.length} PDFs: ${openedPdfsContext}, and is currently viewing page ${viewingPage} of "${viewingPdfName}". Reply in Markdown format.`;
  // console.log("System message", systemMessage);
  return systemMessage;
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
