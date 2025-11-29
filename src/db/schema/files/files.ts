import {
  type AnyPgColumn,
  index,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const filesTable = pgTable(
  "files",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    type: text("type", { enum: ["folder", "pdf", "notes"] }).notNull(),
    parentId: text("parent_id").references((): AnyPgColumn => filesTable.id),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("files_parent_id_idx").on(table.parentId),
    index("files_type_idx").on(table.type),
    index("files_created_at_idx").on(table.createdAt),
    index("files_updated_at_idx").on(table.updatedAt),
  ],
);

export type FileNode = typeof filesTable.$inferSelect;
