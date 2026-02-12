import { convertToModelMessages, type ModelMessage, type UIMessage } from "ai";
import { and, eq, getTableColumns } from "drizzle-orm";
import type { Context } from "@/atoms/chat/contexts";
import { db } from "@/db";
import { filesTable, pdfsTable } from "@/db/schema";
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

export const buildSystemMessage = async ({
  userId,
  source,
}: {
  userId: string;
  source?: { type: "pdf"; pdfId: string; viewingPage: number };
}) => {
  if (!source) {
    return "No pdf or webpage source opened";
  }

  if (source.type === "pdf") {
    const [viewingPdf] = await db
      .select({
        ...getTableColumns(pdfsTable),
        name: filesTable.name,
      })
      .from(pdfsTable)
      .innerJoin(filesTable, eq(filesTable.id, pdfsTable.id))
      .where(
        and(eq(pdfsTable.id, source.pdfId), eq(filesTable.userId, userId)),
      );

    return `You are a helpful AI assistant. The user is viewing page ${source.viewingPage} of ${viewingPdf?.name} (id: ${viewingPdf?.id}, total pages: ${viewingPdf?.pageCount}). Follow these rules:
  
1. Respond in GitHub Flavored Markdown (GFM) format
2. For mathematical expressions, all MUST be expressed in KaTeX and wrapped by double dollar signs`;
  }
};

export const buildMessages = async (
  messages: UIMessage[],
  contexts?: Context[],
): Promise<ModelMessage[]> => {
  const currentMessage = messages[messages.length - 1];
  if (currentMessage.role !== "user") {
    return await convertToModelMessages(messages);
  }
  const initialMessages = messages.slice(0, -1);

  const textContent = buildTextContent(
    getTextFromMessage(currentMessage),
    contexts,
  );
  const imageContent = buildImageContent(contexts);
  return [
    ...(await convertToModelMessages(initialMessages)),
    {
      role: "user",
      content: [textContent, ...imageContent].filter(Boolean),
    } as ModelMessage,
  ];
};
