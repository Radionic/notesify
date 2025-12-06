import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  index,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "@/db/schema/auth";

export const filesTable = pgTable(
  "files",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    type: text("type", { enum: ["folder", "pdf", "notes"] }).notNull(),
    parentId: text("parent_id").references((): AnyPgColumn => filesTable.id, {
      onDelete: "cascade",
    }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("files_parent_id_idx").on(table.parentId),
    index("files_user_id_idx").on(table.userId),
    index("files_type_idx").on(table.type),
    index("files_created_at_idx").on(table.createdAt),
    index("files_updated_at_idx").on(table.updatedAt),
    index("files_name_trgm_idx").using("gin", sql`${table.name} gin_trgm_ops`),
  ],
);

export type FileNode = typeof filesTable.$inferSelect;
