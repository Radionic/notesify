import { index, integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";
import { pdfsTable } from "@/db/schema/pdf/pdfs";
import type { Rect } from "@/lib/types";

export const highlightsTable = pgTable(
  "highlights",
  {
    id: text("id").primaryKey(),
    rects: jsonb("rects").$type<Rect[]>().notNull(),
    color: text("color").notNull(),
    text: text("text").notNull(),
    pageNumber: integer("page_number").notNull(),
    pdfId: text("pdf_id")
      .references(() => pdfsTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [index("highlights_pdf_id_idx").on(table.pdfId)],
);

export type Highlight = typeof highlightsTable.$inferInsert;
