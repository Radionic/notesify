import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { db } from "@/db";
import { type FileNode, filesTable } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { generateId } from "@/lib/id";
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
  parentId: z.string().nullable().optional(),
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
      parentId: data.parentId ?? null,
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
      createdAt: new Date(),
      updatedAt: new Date(),
    } as FileNode;

    await db.insert(filesTable).values(newFile);
    return newFile;
  });
