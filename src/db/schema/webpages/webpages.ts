import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { filesTable } from "@/db/schema/files/files";

export const webpagesTable = pgTable("webpages", {
  id: text("id")
    .primaryKey()
    .references(() => filesTable.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  favicon: text("favicon"),
  status: integer("status"),
  description: text("description"),
  content: text("content").notNull().default(""),
  publishedAt: timestamp("published_at", { mode: "date" }),
});

export const webpagesRelations = relations(webpagesTable, ({ one }) => ({
  file: one(filesTable, {
    fields: [webpagesTable.id],
    references: [filesTable.id],
  }),
}));

export type Webpage = typeof webpagesTable.$inferSelect;
