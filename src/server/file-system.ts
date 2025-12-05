import { createServerFn } from "@tanstack/react-start";
import { and, asc, desc, eq, ilike, isNull, sql } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { type FileNode, filesTable } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { generateId } from "@/lib/id";

const getFileSchema = z.object({
  id: z.string(),
});

export const getFileFn = createServerFn()
  .inputValidator(getFileSchema)
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
    return file ?? null;
  });

export type BreadcrumbItem = {
  id: string;
  name: string;
  parentId: string | null;
};

async function getFolderBreadcrumbs(
  folderId: string,
): Promise<BreadcrumbItem[]> {
  const cteName = sql`file_path`;

  const baseQuery = db
    .select({
      id: filesTable.id,
      name: filesTable.name,
      parentId: filesTable.parentId,
      depth: sql`1`.as("depth"),
    })
    .from(filesTable)
    .where(eq(filesTable.id, folderId));

  const recursiveQuery = db
    .select({
      id: filesTable.id,
      name: filesTable.name,
      parentId: filesTable.parentId,
      depth: sql`file_path.depth + 1`.as("depth"),
    })
    .from(filesTable)
    .innerJoin(cteName, eq(filesTable.id, sql`file_path.parent_id`));

  const combinedQuery = baseQuery.unionAll(recursiveQuery);

  const result = await db.execute(sql`
    WITH RECURSIVE ${cteName} AS (
      ${combinedQuery}
    )
    SELECT * FROM ${cteName}
    ORDER BY depth DESC
  `);

  return result.rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    parentId: row.parent_id as string | null,
  }));
}

const getFilesSchema = z.object({
  parentId: z.string().nullable(),
  search: z.string().optional(),
  orderBy: z.enum(["asc", "desc"]).optional().default("desc"),
  includeBreadcrumbs: z.boolean().optional(),
});

export const getFilesFn = createServerFn()
  .inputValidator(getFilesSchema)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { parentId, search, orderBy, includeBreadcrumbs } = data;
    const [files, breadcrumbs] = await Promise.all([
      db.query.filesTable.findMany({
        where: and(
          eq(filesTable.userId, session.user.id),
          search && search.trim().length > 0
            ? ilike(filesTable.name, `%${search}%`)
            : parentId
              ? eq(filesTable.parentId, parentId)
              : isNull(filesTable.parentId),
        ),
        orderBy: [
          orderBy === "desc"
            ? desc(filesTable.updatedAt)
            : asc(filesTable.updatedAt),
        ],
      }),
      includeBreadcrumbs && parentId ? getFolderBreadcrumbs(parentId) : null,
    ]);

    return { files, breadcrumbs };
  });

const addFolderSchema = z.object({
  name: z.string(),
  parentId: z.string().nullable(),
});

export const addFolderFn = createServerFn()
  .inputValidator(addFolderSchema)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { name, parentId } = data;
    const newFile = {
      id: generateId(),
      name,
      type: "folder",
      parentId,
      userId: session.user.id,
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
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

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
      userId: session.user.id,
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
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    await db
      .delete(filesTable)
      .where(
        and(eq(filesTable.id, data.id), eq(filesTable.userId, session.user.id)),
      );
  });

const renameFileSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const renameFileFn = createServerFn()
  .inputValidator(renameFileSchema)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    await db
      .update(filesTable)
      .set({ name: data.name, updatedAt: new Date() })
      .where(
        and(eq(filesTable.id, data.id), eq(filesTable.userId, session.user.id)),
      );
  });
