import { index, pgTable, text } from "drizzle-orm/pg-core";
import { filesTable } from "@/db/schema/files/files";
import { pdfsTable } from "@/db/schema/pdf/pdfs";

export const notesTable = pgTable(
  "notes",
  {
    id: text("id")
      .primaryKey()
      .references(() => filesTable.id, { onDelete: "cascade" }),
    pdfId: text("pdf_id").references(() => pdfsTable.id, {
      onDelete: "cascade",
    }),
    title: text("title").notNull(),
    content: text("content").notNull(),
  },
  (table) => [index("notes_pdf_id_idx").on(table.pdfId)],
);

export type Notes = typeof notesTable.$inferSelect;
