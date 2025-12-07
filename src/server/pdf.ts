import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import {
  type FileNode,
  filesTable,
  type PDFIndexItem,
  type Pdf,
  pdfIndexingTable,
  pdfsTable,
  type ScrollPosition,
} from "@/db/schema";
import { upsertText } from "@/lib/ai/vectorize";
import { getSession } from "@/lib/auth";
import { generateId } from "@/lib/id";
import { uploadFilesToStorage } from "@/lib/storage";

const getPdfSchema = z.object({
  id: z.string(),
});

export const getPdfFn = createServerFn()
  .inputValidator(getPdfSchema)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const file = await db.query.filesTable.findFirst({
      where: and(
        eq(filesTable.id, data.id),
        eq(filesTable.userId, session.user.id),
      ),
    });

    if (!file) {
      return null;
    }

    const pdf = await db.query.pdfsTable.findFirst({
      where: eq(pdfsTable.id, data.id),
    });
    return pdf ?? null;
  });

type AddPdfInput = {
  name: string;
  parentId: string | null;
  texts: string[];
  images: File[];
  pdfData: File;
};

export const addPdfFn = createServerFn({ method: "POST" })
  .inputValidator((formData: FormData): AddPdfInput => {
    const name = formData.get("name");
    const parentId = formData.get("parentId");
    const textEntries = formData.getAll("texts");
    const imageEntries = formData.getAll("images");
    const pdfData = formData.get("pdfData");

    if (!(pdfData instanceof File)) {
      throw new Error("PDF file is required");
    }

    if (typeof name !== "string" || !name) {
      throw new Error("Invalid name");
    }

    if (typeof parentId !== "string" && parentId !== null) {
      throw new Error("Invalid parentId");
    }

    const texts: string[] = textEntries.filter(
      (entry): entry is string => typeof entry === "string",
    );

    const images: File[] = imageEntries.filter(
      (entry): entry is File => entry instanceof File,
    );
    if (!images.length) {
      throw new Error("At least one image is required");
    }

    return { name, parentId, texts, images, pdfData };
  })
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const id = generateId();
    const newPdf: Pdf = {
      id,
      pageCount: 0,
      scroll: { x: 0, y: 0 },
      zoom: 1,
    };
    const newFile: FileNode = {
      id,
      name: data.name,
      type: "pdf",
      parentId: data.parentId,
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const pdfIndexingItems: PDFIndexItem[] = data.texts.map((text, i) => {
      return {
        id: generateId(),
        pdfId: newPdf.id,
        type: "page" as const,
        startPage: i + 1,
        endPage: i + 1,
        text,
      };
    });

    await Promise.all([
      (async () => {
        await db.insert(filesTable).values(newFile);
        await db.insert(pdfsTable).values(newPdf);
        await db.insert(pdfIndexingTable).values(pdfIndexingItems);
      })(),
      uploadFilesToStorage({
        userId: session.user.id,
        files: [
          {
            type: "pdfs" as const,
            filename: `${id}.pdf`,
            file: data.pdfData,
          },
          ...data.images.map((file, index) => ({
            type: "pdf-images" as const,
            subfolders: [id],
            filename: `p-${index + 1}.jpg`,
            file,
          })),
        ],
      }),
      // TODO: index pdf in background/when needed?
      upsertText(
        pdfIndexingItems.map((item) => ({
          id: item.id,
          text: item.text,
          metadata: {
            userId: session.user.id,
            pdfId: item.pdfId,
            type: "page" as const,
            text: item.text,
            startPage: item.startPage,
            endPage: item.endPage,
          },
        })),
      ),
    ]);

    return { newPdf, newFile };
  });

const updatePdfSchema = z.object({
  id: z.string(),
  pageCount: z.number().optional(),
  scroll: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .optional(),
  zoom: z.number().optional(),
});

export const updatePdfFn = createServerFn({ method: "POST" })
  .inputValidator(updatePdfSchema)
  .handler(async ({ data }) => {
    const { id, pageCount, scroll, zoom } = data;
    const updateValues: Partial<Pdf> = {};

    if (pageCount !== undefined) updateValues.pageCount = pageCount;
    if (scroll !== undefined) updateValues.scroll = scroll as ScrollPosition;
    if (zoom !== undefined) updateValues.zoom = zoom;

    if (Object.keys(updateValues).length > 0) {
      await db.update(pdfsTable).set(updateValues).where(eq(pdfsTable.id, id));
    }
    return updateValues;
  });
