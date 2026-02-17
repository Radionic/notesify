import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
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
    extension: text("extension"),
    type: text("type", {
      enum: ["folder", "pdf", "notes", "webpage", "image"],
    }).notNull(),
    parentId: text("parent_id").references((): AnyPgColumn => filesTable.id, {
      onDelete: "cascade",
    }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    inLibrary: boolean("in_library").notNull().default(true),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("files_parent_id_idx").on(table.parentId),
    index("files_user_id_idx").on(table.userId),
    index("files_type_idx").on(table.type),
    index("files_in_library_idx").on(table.inLibrary),
    index("files_created_at_idx").on(table.createdAt),
    index("files_updated_at_idx").on(table.updatedAt),
    index("files_name_trgm_idx").using("gin", sql`${table.name} gin_trgm_ops`),
  ],
);

export type FileNode = typeof filesTable.$inferSelect;
