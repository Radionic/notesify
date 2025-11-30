import { jsonb, pgTable, smallint, text } from "drizzle-orm/pg-core";
import { pdfsTable } from "@/db/schema/pdf/pdfs";

export const pdfParsingTable = pgTable("pdf_parsing", {
  id: text("id").primaryKey(),
  pdfId: text("pdf_id")
    .notNull()
    .references(() => pdfsTable.id, { onDelete: "cascade" }),
  model: text("model").notNull(),
  text: text("text").notNull(),
  images: jsonb("images").$type<string[]>(),
  page: smallint("page").notNull(),
});

export type ParsedPDFPage = typeof pdfParsingTable.$inferSelect;
