import {
  type AnySQLiteColumn,
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const filesTable = sqliteTable(
  "files",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    type: text("type", { enum: ["folder", "pdf", "notes"] }).notNull(),
    parentId: text("parent_id").references(
      (): AnySQLiteColumn => filesTable.id,
    ),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("files_parent_id_idx").on(table.parentId),
    index("files_type_idx").on(table.type),
    index("files_created_at_idx").on(table.createdAt),
    index("files_updated_at_idx").on(table.updatedAt),
  ],
);

export type FileNode = typeof filesTable.$inferSelect;
