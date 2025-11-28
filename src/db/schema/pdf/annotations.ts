import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { pdfsTable } from "@/db/schema/pdf/pdfs";

export const annotationsTable = sqliteTable(
  "annotations",
  {
    id: text("id").primaryKey(),
    type: text("type", { enum: ["pen", "highlighter"] }).notNull(),
    path: text("path").notNull(),
    color: text("color").notNull(),
    size: integer("size").notNull(),
    page: integer("page").notNull(),
    pdfId: text("pdf_id")
      .references(() => pdfsTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [index("annotations_pdf_id_idx").on(table.pdfId)],
);

export type Annotation = typeof annotationsTable.$inferSelect;
