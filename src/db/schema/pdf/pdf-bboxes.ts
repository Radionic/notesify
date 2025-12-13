import { relations } from "drizzle-orm";
import { index, jsonb, pgTable, smallint, text } from "drizzle-orm/pg-core";
import { pdfIndexingTable } from "@/db/schema/pdf/pdf-indexing";

export type PdfTextBbox = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  start: number;
  end: number;
};

export type PdfPageBboxes = {
  page: number;
  bboxes: PdfTextBbox[];
};

export const pdfBboxesTable = pgTable(
  "pdf_bboxes",
  {
    id: text("id").primaryKey(),
    pdfIndexingId: text("pdf_indexing_id")
      .notNull()
      .references(() => pdfIndexingTable.id, { onDelete: "cascade" }),
    pageNumber: smallint("page_number").notNull(),
    bboxes: jsonb("bboxes").$type<PdfTextBbox[]>().notNull(),
  },
  (table) => [index("pdf_bboxes_pdf_indexing_id_idx").on(table.pdfIndexingId)],
);

export const pdfBboxesRelations = relations(pdfBboxesTable, ({ one }) => ({
  pdfIndexing: one(pdfIndexingTable, {
    fields: [pdfBboxesTable.pdfIndexingId],
    references: [pdfIndexingTable.id],
  }),
}));

export type PdfBboxes = typeof pdfBboxesTable.$inferSelect;
