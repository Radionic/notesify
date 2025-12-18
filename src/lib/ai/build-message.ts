import { convertToModelMessages, type ModelMessage, type UIMessage } from "ai";
import { and, eq, getTableColumns, inArray } from "drizzle-orm";
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
  openedPdfIds,
  pdfId,
  viewingPage,
}: {
  userId: string;
  openedPdfIds: string[];
  pdfId: string;
  viewingPage: number;
}) => {
  if (openedPdfIds.length === 0) {
    return "No PDFs opened";
  }

  const openedPdfs = await db
    .select({
      ...getTableColumns(pdfsTable),
      name: filesTable.name,
    })
    .from(pdfsTable)
    .innerJoin(filesTable, eq(filesTable.id, pdfsTable.id))
    .where(
      and(inArray(pdfsTable.id, openedPdfIds), eq(filesTable.userId, userId)),
    );

  // Only 1 opened pdf for now
  // const openedPdfsContext = openedPdfs
  //   .map(
  //     (pdf) =>
  //       `{ name: "${pdf.name}", id: "${pdf.id}", totalPages: ${pdf.pageCount} }`,
  //   )
  //   .join(", ");
  const viewingPdf = openedPdfs.find((pdf) => pdf.id === pdfId);
  return `You are a helpful PDF assistant. The user is viewing page ${viewingPage} of ${viewingPdf?.name} (id: ${viewingPdf?.id}, total pages: ${viewingPdf?.pageCount}). Follow these rules:
  
1. Respond in GitHub Flavored Markdown (GFM) format
2. For mathematical expressions, all MUST be expressed in KaTeX and wrapped by double dollar signs
3. When user asks for sources, citations or location, and you have enough context, use this Markdown Blockquote format to reference/cite PDF content:
> pdfId: {pdf id}
> pdfPage: {pdf page number}
>
> {exact quotes from the pdf page, no rephrasing or summarizing}
`;
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
