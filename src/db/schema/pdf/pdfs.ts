import { relations } from "drizzle-orm";
import { jsonb, numeric, pgTable, smallint, text } from "drizzle-orm/pg-core";
import { filesTable } from "@/db/schema/files/files";

export type ScrollPosition = {
  x: number;
  y: number;
};

export const pdfsTable = pgTable("pdfs", {
  id: text("id")
    .primaryKey()
    .references(() => filesTable.id, { onDelete: "cascade" }),
  pageCount: smallint("page_count").notNull().default(0),
  scroll: jsonb("scroll").$type<ScrollPosition>().notNull().default({
    x: 0,
    y: 0,
  }),
  zoom: numeric("zoom", { precision: 4, scale: 2, mode: "number" })
    .notNull()
    .default(1),
});

export const pdfsRelations = relations(pdfsTable, ({ one }) => ({
  file: one(filesTable, {
    fields: [pdfsTable.id],
    references: [filesTable.id],
  }),
}));

export type Pdf = typeof pdfsTable.$inferSelect;
