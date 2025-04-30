import { FileNode, filesTable } from "@/db/schema";
import { getDB } from "@/db/sqlite";
import { generateId } from "@/lib/id";
import { asc, desc, eq, isNull } from "drizzle-orm";

export const getFile = async ({ id }: { id: string }) => {
  const db = await getDB();
  const file = await db.query.filesTable.findFirst({
    where: eq(filesTable.id, id),
  });
  return file ?? null;
};

export const getFiles = async ({
  parentId,
  orderBy = "desc",
}: {
  parentId: string | null;
  orderBy?: "asc" | "desc";
}) => {
  const db = await getDB();
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
};

export const addFolder = async ({
  name,
  parentId,
}: {
  name: string;
  parentId: string | null;
}) => {
  const db = await getDB();
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
};

export const addFile = async ({
  name,
  parentId,
  notesId,
  pdfId,
}: {
  name: string;
  parentId: string | null;
  notesId?: string;
  pdfId?: string;
}) => {
  if (!pdfId && !notesId) {
    throw Error("No PDF or Notes provided");
  }

  if (pdfId && notesId) {
    throw Error("Cannot add both PDF and Notes");
  }

  const db = await getDB();
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
};

export const removeFile = async ({ id }: { id: string }) => {
  const db = await getDB();
  await db.delete(filesTable).where(eq(filesTable.id, id));
};

export const renameFile = async ({
  id,
  name,
}: {
  id: string;
  name: string;
}) => {
  const db = await getDB();
  await db
    .update(filesTable)
    .set({ name, updatedAt: new Date() })
    .where(eq(filesTable.id, id));
};
