import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import {
  filesTable,
  type Pdf,
  pdfsTable,
  type ScrollPosition,
} from "@/db/schema";
import { getSession } from "@/lib/auth";

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
