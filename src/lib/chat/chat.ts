import { CoreUserMessage, generateText, LanguageModelV1, Message } from "ai";

import { Context } from "@/atoms/chat/contexts";
import { OpenedPDF } from "@/queries/pdf/use-pdf";

const buildTextContent = (content: string, contexts?: Context[]) => {
  const textContext = contexts
    ?.filter((c) => c.type === "text")
    .map((c) => c.content)
    .join("\n\n");
  return {
    type: "text",
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
        type: "image",
        image: c.content,
      })) || []
  );
};

export const buildSystemMessage = (
  openedPdfs?: OpenedPDF[],
  viewingPdfId?: string,
  viewingPage?: number
) => {
  if (!openedPdfs || !viewingPdfId || !viewingPage) {
    return "You are a helpful assistant. Reply in Markdown format.";
  }

  const openedPdfsContext = openedPdfs
    .map(
      (pdf) =>
        `{ name: "${pdf.name}", id: "${pdf.id}", totalPages: ${pdf.pageCount} }`
    )
    .join(", ");
  const viewingPdfName = openedPdfs.find(
    (pdf) => pdf.id === viewingPdfId
  )?.name;

  const systemMessage = `You are a helpful PDF assistant. The user has opened ${openedPdfs.length} PDFs: ${openedPdfsContext}, and is currently viewing page ${viewingPage} of "${viewingPdfName}". Reply in Markdown format.`;
  // console.log("System message", systemMessage);
  return systemMessage;
};

export const buildMessages = (messages: Message[], contexts?: Context[]) => {
  const currentMessage = messages[messages.length - 1];
  if (currentMessage.role !== "user") {
    return messages;
  }
  const initialMessages = messages.slice(0, -1);

  const textContent = buildTextContent(currentMessage.content, contexts);
  const imageContent = buildImageContent(contexts);
  return [
    ...initialMessages,
    {
      role: "user",
      content: [textContent, ...imageContent].filter(Boolean),
    } as CoreUserMessage,
  ];
};

export const generateTitle = async (
  model: LanguageModelV1,
  messages: Message[]
) => {
  let text = "";
  for (const message of messages) {
    if (message.role === "user") {
      text += `User: ${message.content}\n`;
    } else if (message.role === "assistant" && message.content) {
      text += `AI: ${message.content}\n`;
    }
  }
  text = text.slice(0, 1000);

  const prompt = `Create a short title, starting with a meaningful emoji, for the following text. Do not use Markdown.\n${text}`;
  const res = await generateText({
    model,
    prompt,
  });
  const title = res.text;
  return title;
};
