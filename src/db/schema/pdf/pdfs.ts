import { integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";
import { filesTable } from "@/db/schema/files/files";

export type ScrollPosition = {
  x: number;
  y: number;
};

export const pdfsTable = pgTable("pdfs", {
  id: text("id")
    .primaryKey()
    .references(() => filesTable.id, { onDelete: "cascade" }),
  pageCount: integer("page_count").notNull().default(0),
  scroll: jsonb("scroll")
    .$type<ScrollPosition>()
    .notNull()
    .default({
      x: 0,
      y: 0,
    }),
  zoom: integer("zoom").notNull().default(1),
});

export type Pdf = typeof pdfsTable.$inferSelect;
