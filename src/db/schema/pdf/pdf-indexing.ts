import { relations } from "drizzle-orm";
import { pgEnum, pgTable, smallint, text } from "drizzle-orm/pg-core";
import { pdfsTable } from "@/db/schema/pdf/pdfs";

export type PDFIndexingLevel = "document" | "page" | "section";

export const typeEnum = pgEnum("pdf_indexing_type", [
  "document",
  "page",
  "section",
]);

// Note: embedding is stored in Cloudflare Vectorize instead
export const pdfIndexingTable = pgTable("pdf_indexing", {
  id: text("id").primaryKey(),
  pdfId: text("pdf_id")
    .notNull()
    .references(() => pdfsTable.id, { onDelete: "cascade" }),
  title: text("title"),
  content: text("content").notNull(),
  type: typeEnum().notNull(),
  startPage: smallint("start_page"), // null for document level
  endPage: smallint("end_page"), // null for document level
});

export const pdfIndexingRelations = relations(pdfIndexingTable, ({ one }) => ({
  pdf: one(pdfsTable, {
    fields: [pdfIndexingTable.pdfId],
    references: [pdfsTable.id],
  }),
}));

export type PDFIndexItem = typeof pdfIndexingTable.$inferSelect;
