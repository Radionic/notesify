import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { db } from "@/db";
import {
  type FileNode,
  filesTable,
  type PDFIndexItem,
  type Pdf,
  type PdfBboxes,
  pdfBboxesTable,
  pdfIndexingTable,
  pdfsTable,
} from "@/db/schema";
import { getSession } from "@/lib/auth";
import { generateId } from "@/lib/id";
import { sanitizePdfText } from "@/lib/pdf/sanitize-text";
import { getObjectKey, presignUrl } from "@/lib/storage";

const uploadFileTypeSchema = z.enum(["image", "pdf"]);

const uploadLimitsByType = {
  image: {
    maxBytes: 10 * 1024 * 1024,
    storageType: "images",
    acceptedContentTypes: /^image\//,
  },
  pdf: {
    maxBytes: 50 * 1024 * 1024,
    storageType: "pdfs",
    acceptedContentTypes: /^application\/pdf$/,
  },
};

const createUploadUrlSchema = z.object({
  name: z.string(),
  type: uploadFileTypeSchema,
  contentType: z.string(),
  size: z.number().int().positive(),
  parentId: z.string().nullable(),
});

export const createUploadUrlFn = createServerFn()
  .inputValidator(createUploadUrlSchema)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const config = uploadLimitsByType[data.type];
    if (!config.acceptedContentTypes.test(data.contentType)) {
      throw new Error("Invalid content type");
    }
    if (data.size > config.maxBytes) {
      throw new Error(
        `File too large. Max size is ${Math.floor(config.maxBytes / (1024 * 1024))}MB`,
      );
    }

    const fileId = generateId();
    const lastDotIndex = data.name.lastIndexOf(".");
    const extension =
      lastDotIndex > 0 ? data.name.slice(lastDotIndex + 1) : null;
    const nameWithoutExt =
      lastDotIndex > 0 ? data.name.slice(0, lastDotIndex) : data.name;
    const filename = extension ? `${fileId}.${extension}` : fileId;
    const key = getObjectKey({
      type: config.storageType as "pdfs" | "images",
      userId: session.user.id,
      filename,
    });
    const uploadUrl = await presignUrl({
      key,
      method: "PUT",
      contentType: data.contentType,
    });

    return {
      fileId,
      fileType: data.type,
      fileName: nameWithoutExt,
      fileExtension: extension,
      parentId: data.parentId,
      contentType: data.contentType,
      uploadUrl,
    };
  });

const completeUploadSchema = z.object({
  fileId: z.string(),
  fileType: uploadFileTypeSchema,
  fileName: z.string().min(1),
  fileExtension: z.string().nullish(),
  parentId: z.string().nullable().optional(),
  inLibrary: z.boolean().optional().default(true),
});

export const completeUploadFn = createServerFn()
  .inputValidator(completeUploadSchema)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const newFile = {
      id: data.fileId,
      name: data.fileName,
      extension: data.fileExtension,
      type: data.fileType,
      parentId: data.parentId ?? null,
      userId: session.user.id,
      inLibrary: data.inLibrary,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as FileNode;

    await db.insert(filesTable).values(newFile);
    return newFile;
  });

const createPdfUploadUrlsSchema = z.object({
  imageCount: z.number().int().positive(),
});

export const createPdfUploadUrlsFn = createServerFn({ method: "POST" })
  .inputValidator(createPdfUploadUrlsSchema)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const fileId = generateId();

    const pdfKey = getObjectKey({
      type: "pdfs",
      userId: session.user.id,
      filename: `${fileId}.pdf`,
    });
    const pdfUploadUrl = await presignUrl({
      key: pdfKey,
      method: "PUT",
      contentType: "application/pdf",
    });

    const imageUploads = await Promise.all(
      Array.from({ length: data.imageCount }, async (_, index) => {
        const page = index + 1;
        const key = getObjectKey({
          type: "pdf-images",
          userId: session.user.id,
          subfolders: [fileId],
          filename: `p-${page}.jpg`,
        });
        const uploadUrl = await presignUrl({
          key,
          method: "PUT",
          contentType: "image/jpeg",
        });

        return {
          page,
          uploadUrl,
        };
      }),
    );

    return {
      fileId,
      pdfUploadUrl,
      imageUploads,
    };
  });

const pdfTextBboxSchema = z.object({
  top: z.number(),
  left: z.number(),
  right: z.number(),
  bottom: z.number(),
  start: z.number().int().nonnegative(),
  end: z.number().int().nonnegative(),
});

const completePdfUploadSchema = z.object({
  fileId: z.string(),
  name: z.string().min(1),
  parentId: z.string().nullable(),
  totalPages: z.number().int().positive(),
  texts: z.array(z.string()),
  bboxes: z.array(
    z.object({
      page: z.number().int().positive(),
      bboxes: z.array(pdfTextBboxSchema),
    }),
  ),
  inLibrary: z.boolean().optional().default(true),
});

export const completePdfUploadFn = createServerFn({ method: "POST" })
  .inputValidator(completePdfUploadSchema)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const newPdf: Pdf = {
      id: data.fileId,
      pageCount: data.totalPages,
      scroll: { x: 0, y: 0 },
      zoom: 1,
    };

    const newFile: FileNode = {
      id: data.fileId,
      name: data.name,
      extension: "pdf",
      type: "pdf",
      parentId: data.parentId,
      userId: session.user.id,
      inLibrary: data.inLibrary,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const bboxesByPage = new Map<number, z.infer<typeof pdfTextBboxSchema>[]>(
      data.bboxes.map((page) => [page.page, page.bboxes]),
    );
    const pdfIndexingItems: PDFIndexItem[] = [];
    const pdfBboxesItems: PdfBboxes[] = [];

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

    await db.insert(filesTable).values(newFile);
    await db.insert(pdfsTable).values(newPdf);
    await db.insert(pdfIndexingTable).values(pdfIndexingItems);
    await db.insert(pdfBboxesTable).values(pdfBboxesItems);

    return { newPdf, newFile };
  });
