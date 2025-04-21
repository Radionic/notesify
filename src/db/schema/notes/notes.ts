import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { pdfsTable } from "@/db/schema/pdf/pdfs";
import { filesTable } from "@/db/schema/files/files";

export const notesTable = sqliteTable(
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
  (table) => [index("notes_pdf_id_idx").on(table.pdfId)]
);

export type Notes = typeof notesTable.$inferSelect;
