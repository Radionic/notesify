import { createServerFn } from "@tanstack/react-start";
import { and, asc, desc, eq, ilike, inArray, isNull, sql } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { type FileNode, filesTable, pdfIndexingTable } from "@/db/schema";
import { deleteEmbeddingsByIds } from "@/lib/ai/vectorize";
import { getSession } from "@/lib/auth";
import { generateId } from "@/lib/id";
import { removeFileFromStorage, removeFolderFromStorage } from "@/lib/storage";

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
          eq(filesTable.inLibrary, true),
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
  pdfId: z.string().optional(),
});

export const addFileFn = createServerFn()
  .inputValidator(addFileSchema)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { name, parentId, pdfId } = data;
    if (!pdfId) {
      throw Error("No PDF provided");
    }

    const newFile = {
      id: pdfId,
      name,
      type: pdfId,
      parentId,
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as FileNode;
    await db.insert(filesTable).values(newFile);
    return newFile;
  });

async function getFilesInFolder(
  userId: string,
  folderId: string,
): Promise<Array<{ id: string; extension: string | null; type: string }>> {
  const cteName = sql`file_tree`;

  const baseQuery = db
    .select({
      id: filesTable.id,
      extension: filesTable.extension,
      type: filesTable.type,
      parentId: filesTable.parentId,
    })
    .from(filesTable)
    .where(and(eq(filesTable.id, folderId), eq(filesTable.userId, userId)));

  const recursiveQuery = db
    .select({
      id: filesTable.id,
      extension: filesTable.extension,
      type: filesTable.type,
      parentId: filesTable.parentId,
    })
    .from(filesTable)
    .innerJoin(
      cteName,
      and(
        eq(filesTable.parentId, sql`file_tree.id`),
        eq(filesTable.userId, userId),
      ),
    );

  const combinedQuery = baseQuery.unionAll(recursiveQuery);

  const result = await db.execute(sql`
    WITH RECURSIVE ${cteName} AS (
      ${combinedQuery}
    )
    SELECT id, extension, type FROM ${cteName}
  `);

  return result.rows
    .filter((row) => row.type !== "folder")
    .map((row) => ({
      id: row.id as string,
      extension: row.extension as string | null,
      type: row.type as string,
    }));
}

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

    const file = await db.query.filesTable.findFirst({
      where: and(
        eq(filesTable.id, data.id),
        eq(filesTable.userId, session.user.id),
      ),
    });
    if (!file) {
      throw new Error("File not found");
    }

    const operations: Promise<unknown>[] = [
      db
        .delete(filesTable)
        .where(
          and(
            eq(filesTable.id, data.id),
            eq(filesTable.userId, session.user.id),
          ),
        ),
    ];

    if (file.type === "folder") {
      const files = await getFilesInFolder(session.user.id, data.id);

      const pdfFiles = files.filter((f) => f.type === "pdf");
      const pdfIds = pdfFiles.map((f) => f.id);

      if (pdfIds.length > 0) {
        const indexItems = await db.query.pdfIndexingTable.findMany({
          where: inArray(pdfIndexingTable.pdfId, pdfIds),
        });
        operations.push(
          deleteEmbeddingsByIds(indexItems.map((item) => item.id)),
        );

        pdfFiles.forEach((pdfFile) => {
          operations.push(
            removeFileFromStorage({
              type: "pdfs",
              userId: session.user.id,
              filename: `${pdfFile.id}.pdf`,
            }),
            removeFolderFromStorage({
              type: "pdf-images",
              userId: session.user.id,
              subfolders: [pdfFile.id],
            }),
          );
        });
      }

      const imageFiles = files.filter((f) => f.type === "image");
      imageFiles.forEach((imageFile) => {
        const filename = imageFile.extension
          ? `${imageFile.id}.${imageFile.extension}`
          : imageFile.id;
        operations.push(
          removeFileFromStorage({
            type: "images",
            userId: session.user.id,
            filename,
          }),
        );
      });
    } else if (file.type === "pdf") {
      const indexItems = await db.query.pdfIndexingTable.findMany({
        where: eq(pdfIndexingTable.pdfId, data.id),
      });
      operations.push(deleteEmbeddingsByIds(indexItems.map((item) => item.id)));

      const filename = file.extension
        ? `${data.id}.${file.extension}`
        : `${data.id}.pdf`;
      operations.push(
        removeFileFromStorage({
          type: "pdfs",
          userId: session.user.id,
          filename,
        }),
        removeFolderFromStorage({
          type: "pdf-images",
          userId: session.user.id,
          subfolders: [data.id],
        }),
      );
    } else if (file.type === "image") {
      const filename = file.extension
        ? `${data.id}.${file.extension}`
        : data.id;
      operations.push(
        removeFileFromStorage({
          type: "images",
          userId: session.user.id,
          filename,
        }),
      );
    }

    await Promise.all(operations);
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
