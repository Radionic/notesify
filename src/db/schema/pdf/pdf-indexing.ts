import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { pdfsTable } from "@/db/schema/pdf/pdfs";

export type PDFIndexingLevel = "document" | "page" | "section";

export const pdfIndexingTable = sqliteTable("pdf_indexing", {
  id: text("id").primaryKey(),
  pdfId: text("pdf_id")
    .notNull()
    .references(() => pdfsTable.id, { onDelete: "cascade" }),
  model: text("model").notNull(),
  summary: text("summary").notNull(),
  level: text("level").$type<PDFIndexingLevel>().notNull(),
  startPage: integer("start_page"), // null for document level
  endPage: integer("end_page"), // null for document and page level
});

export type IndexedPDFPage = typeof pdfIndexingTable.$inferSelect;
