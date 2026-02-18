import { convertToModelMessages, type ModelMessage } from "ai";
import { and, eq, getTableColumns, inArray } from "drizzle-orm";
import type { Context } from "@/atoms/chat/contexts";
import { db } from "@/db";
import { filesTable, pdfsTable } from "@/db/schema";
import { getObjectKey, presignUrl } from "@/lib/storage";
import type { MyUIMessage } from "@/routes/api/ai";
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

const buildImageContent = async ({
  contexts,
  userId,
}: {
  contexts?: Context[];
  userId: string;
}) => {
  const imageContexts = contexts?.filter((context) => context.type === "image");
  if (!imageContexts || !imageContexts.length) {
    return [];
  }

  const imageFileIds = imageContexts.map((context) => context.fileId);
  const imageFiles = await db
    .select({
      id: filesTable.id,
      extension: filesTable.extension,
    })
    .from(filesTable)
    .where(
      and(
        eq(filesTable.userId, userId),
        eq(filesTable.type, "image"),
        inArray(filesTable.id, imageFileIds),
      ),
    );

  return (
    await Promise.all(
      imageFiles.map(async (file) => {
        const filename = file.extension
          ? `${file.id}.${file.extension}`
          : file.id;

        const key = getObjectKey({
          type: "images",
          userId,
          filename,
        });
        const imageUrl = await presignUrl({ key, method: "GET" });
        return { type: "image" as const, image: imageUrl };
      }),
    )
  ).filter(Boolean);
};

export const buildSystemMessage = async ({
  userId,
  source,
}: {
  userId: string;
  source?: { type: "pdf"; pdfId: string; viewingPage: number };
}) => {
  if (!source) {
    return "You are a helpful AI assistant.";
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

const buildPdfContent = async ({
  contexts,
  userId,
}: {
  contexts?: Context[];
  userId: string;
}) => {
  const pdfContexts = contexts?.filter((c) => c.type === "pdf");
  if (!pdfContexts?.length) return [];

  const files = await db
    .select({ id: filesTable.id, name: filesTable.name })
    .from(filesTable)
    .where(
      and(
        eq(filesTable.userId, userId),
        inArray(
          filesTable.id,
          pdfContexts.map((c) => c.fileId),
        ),
      ),
    );

  return files.map((file) => {
    return {
      type: "text" as const,
      text: `<pdf name="${file.name}" id="${file.id}" />`,
    };
  });
};

export const buildMessages = async (
  messages: MyUIMessage[],
  userId: string,
): Promise<ModelMessage[]> => {
  const results = await Promise.all(
    messages.map(async (message): Promise<ModelMessage[]> => {
      if (message.role !== "user") {
        return await convertToModelMessages([message]);
      }

      const contexts = message.metadata?.contexts;

      const textContent = buildTextContent(
        getTextFromMessage(message),
        contexts,
      );
      const [imageContent, pdfContent] = await Promise.all([
        buildImageContent({ contexts, userId }),
        buildPdfContent({ contexts, userId }),
      ]);

      return [
        {
          role: "user",
          content: [textContent, ...imageContent, ...pdfContent].filter(
            Boolean,
          ),
        } as ModelMessage,
      ];
    }),
  );
  return results.flat();
};
