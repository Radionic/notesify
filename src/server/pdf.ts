import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import {
  type FileNode,
  filesTable,
  type PDFIndexItem,
  type Pdf,
  pdfBboxesTable,
  pdfIndexingTable,
  pdfsTable,
  type ScrollPosition,
} from "@/db/schema";
import { getSession } from "@/lib/auth";
import { generateId } from "@/lib/id";
import { sanitizePdfText } from "@/lib/pdf/sanitize-text";
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

const pdfTextBboxSchema = z.object({
  top: z.number(),
  left: z.number(),
  right: z.number(),
  bottom: z.number(),
  start: z.number().int().nonnegative(),
  end: z.number().int().nonnegative(),
});

const pdfPageBboxesSchema = z.array(
  z.object({
    page: z.number().int().positive(),
    bboxes: z.array(pdfTextBboxSchema),
  }),
);

type AddPdfInput = {
  name: string;
  parentId: string | null;
  texts: string[];
  bboxes: z.infer<typeof pdfPageBboxesSchema>;
  images: File[];
  pdfData: File;
  totalPages: number;
};

export const addPdfFn = createServerFn({ method: "POST" })
  .inputValidator((formData: FormData): AddPdfInput => {
    const name = formData.get("name");
    const parentId = formData.get("parentId");
    const textEntries = formData.getAll("texts");
    const imageEntries = formData.getAll("images");
    const pdfData = formData.get("pdfData");
    const totalPages = formData.get("totalPages");
    const bboxesRaw = formData.get("bboxes");

    if (!(pdfData instanceof File)) {
      throw new Error("PDF file is required");
    }

    if (typeof name !== "string" || !name) {
      throw new Error("Invalid name");
    }

    if (typeof parentId !== "string" && parentId !== null) {
      throw new Error("Invalid parentId");
    }

    if (typeof totalPages !== "string") {
      throw new Error("Invalid totalPages");
    }

    const parsedTotalPages = Number(totalPages);
    if (!Number.isFinite(parsedTotalPages) || parsedTotalPages <= 0) {
      throw new Error("Invalid totalPages");
    }

    const texts: string[] = textEntries.filter(
      (entry): entry is string => typeof entry === "string",
    );

    if (typeof bboxesRaw !== "string") {
      throw new Error("Invalid bboxes");
    }
    let parsedBboxes: unknown;
    try {
      parsedBboxes = JSON.parse(bboxesRaw);
    } catch {
      throw new Error("Invalid bboxes");
    }
    const bboxes = pdfPageBboxesSchema.parse(parsedBboxes);

    const images: File[] = imageEntries.filter(
      (entry): entry is File => entry instanceof File,
    );
    if (!images.length) {
      throw new Error("At least one image is required");
    }

    return {
      name,
      parentId,
      texts,
      bboxes,
      images,
      pdfData,
      totalPages: parsedTotalPages,
    };
  })
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const id = generateId();
    const newPdf: Pdf = {
      id,
      pageCount: data.totalPages,
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
    const bboxesByPage = new Map<number, z.infer<typeof pdfTextBboxSchema>[]>(
      data.bboxes.map((page) => [page.page, page.bboxes]),
    );
    const pdfIndexingItems: PDFIndexItem[] = [];
    const pdfBboxesItems: {
      id: string;
      pdfIndexingId: string;
      pageNumber: number;
      bboxes: z.infer<typeof pdfTextBboxSchema>[];
    }[] = [];

    for (const [i, rawText] of data.texts.entries()) {
      const pageNumber = i + 1;
      const text = sanitizePdfText(rawText);
      const indexItem: PDFIndexItem = {
        id: generateId(),
        pdfId: newPdf.id,
        type: "page" as const,
        startPage: pageNumber,
        endPage: pageNumber,
        title: null,
        content: text,
      };

      pdfIndexingItems.push(indexItem);
      pdfBboxesItems.push({
        id: generateId(),
        pdfIndexingId: indexItem.id,
        pageNumber,
        bboxes: bboxesByPage.get(pageNumber) ?? [],
      });
    }

    await Promise.all([
      (async () => {
        await db.insert(filesTable).values(newFile);
        await db.insert(pdfsTable).values(newPdf);
        await db.insert(pdfIndexingTable).values(pdfIndexingItems);
        await db.insert(pdfBboxesTable).values(pdfBboxesItems);
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
