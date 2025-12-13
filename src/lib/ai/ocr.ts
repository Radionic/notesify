import { generateText } from "ai";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pdfsTable } from "@/db/schema";
import { aiProvider } from "@/lib/ai/provider";
import { getFileFromStorage } from "@/lib/storage";

const loadPageImage = async (
  pdfId: string,
  userId: string,
  page: number,
): Promise<string> => {
  const body = await getFileFromStorage({
    type: "pdf-images",
    userId,
    filename: `p-${page}.jpg`,
    subfolders: [pdfId],
  });
  if (!body) {
    const pdf = await db.query.pdfsTable.findFirst({
      columns: { id: true },
      where: eq(pdfsTable.id, pdfId),
    });
    if (!pdf) {
      throw Error(`PDF not found: ${pdfId}, check if pdf id is correct`);
    }
    throw Error(`Page not found: ${page} of ${pdfId}`);
  }

  const arrayBuffer = await new Response(body).arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
};

export const extractVisualInfo = async (
  pdfId: string,
  userId: string,
  page: number,
  instruction: string,
): Promise<string> => {
  if (!process.env.PDF_OCR_MODEL_ID) {
    throw Error("PDF_OCR_MODEL_ID not set");
  }

  const base64 = await loadPageImage(pdfId, userId, page);

  const { text } = await generateText({
    model: aiProvider.chatModel(process.env.PDF_OCR_MODEL_ID),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `${instruction} DO NOT include anything else.`,
          },
          { type: "image", image: base64 },
        ],
      },
    ],
  });

  return text.trim();
};
