import { createServerFn } from "@tanstack/react-start";
import { asc, desc, eq, isNull } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { type FileNode, filesTable } from "@/db/schema";
import { generateId } from "@/lib/id";

const getFileSchema = z.object({
  id: z.string(),
});

export const getFileFn = createServerFn()
  .inputValidator(getFileSchema)
  .handler(async ({ data }) => {
    const file = await db.query.filesTable.findFirst({
      where: eq(filesTable.id, data.id),
    });
    return file ?? null;
  });

const getFilesSchema = z.object({
  parentId: z.string().nullable(),
  orderBy: z.enum(["asc", "desc"]).optional(),
});

export const getFilesFn = createServerFn()
  .inputValidator(getFilesSchema)
  .handler(async ({ data }) => {
    const { parentId, orderBy = "desc" } = data;
    const files = await db.query.filesTable.findMany({
      where: parentId
        ? eq(filesTable.parentId, parentId)
        : isNull(filesTable.parentId),
      orderBy: [
        orderBy === "desc"
          ? desc(filesTable.updatedAt)
          : asc(filesTable.updatedAt),
      ],
    });
    return files;
  });

const addFolderSchema = z.object({
  name: z.string(),
  parentId: z.string().nullable(),
});

export const addFolderFn = createServerFn()
  .inputValidator(addFolderSchema)
  .handler(async ({ data }) => {
    const { name, parentId } = data;
    const newFile = {
      id: generateId(),
      name,
      type: "folder",
      parentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as FileNode;
    await db.insert(filesTable).values(newFile);
    return newFile;
  });

const addFileSchema = z.object({
  name: z.string(),
  parentId: z.string().nullable(),
  notesId: z.string().optional(),
  pdfId: z.string().optional(),
});

export const addFileFn = createServerFn()
  .inputValidator(addFileSchema)
  .handler(async ({ data }) => {
    const { name, parentId, notesId, pdfId } = data;
    if (!pdfId && !notesId) {
      throw Error("No PDF or Notes provided");
    }

    if (pdfId && notesId) {
      throw Error("Cannot add both PDF and Notes");
    }

    const newFile = {
      id: pdfId || notesId,
      name,
      type: pdfId ? "pdf" : "notes",
      parentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as FileNode;
    await db.insert(filesTable).values(newFile);
    return newFile;
  });

const removeFileSchema = z.object({
  id: z.string(),
});

export const removeFileFn = createServerFn()
  .inputValidator(removeFileSchema)
  .handler(async ({ data }) => {
    await db.delete(filesTable).where(eq(filesTable.id, data.id));
  });

const renameFileSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const renameFileFn = createServerFn()
  .inputValidator(renameFileSchema)
  .handler(async ({ data }) => {
    await db
      .update(filesTable)
      .set({ name: data.name, updatedAt: new Date() })
      .where(eq(filesTable.id, data.id));
  });
