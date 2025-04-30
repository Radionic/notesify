import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { filesTable } from "@/db/schema/files/files";

export type ScrollPosition = {
  x: number;
  y: number;
};

export const pdfsTable = sqliteTable("pdfs", {
  id: text("id")
    .primaryKey()
    .references(() => filesTable.id, { onDelete: "cascade" }),
  pageCount: integer("page_count").notNull().default(0),
  scroll: text("scroll", { mode: "json" })
    .$type<ScrollPosition>()
    .notNull()
    .default({
      x: 0,
      y: 0,
    }),
  zoom: integer("zoom").notNull().default(1),
});

export type Pdf = typeof pdfsTable.$inferSelect;
