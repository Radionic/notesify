// https://github.com/drizzle-team/drizzle-orm/discussions/2532

import type { SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import migrations from "./migrations.json";
import type * as schema from "./schema";

async function ensureMigrationsTable(db: SqliteRemoteDatabase<typeof schema>) {
  console.log("📦 Ensuring migrations table exists...");
  await db.run(`
    CREATE TABLE IF NOT EXISTS drizzle_migrations (
        hash TEXT PRIMARY KEY,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getMigratedHashes(
  db: SqliteRemoteDatabase<typeof schema>,
): Promise<string[]> {
  const result = await db.all(`
    SELECT hash FROM drizzle_migrations ORDER BY created_at ASC
  `);
  const hashes = result.map((row: any) => row.hash as string);
  console.log("📦 Found migrated hashes:", hashes);
  return hashes;
}

async function recordMigration(
  db: SqliteRemoteDatabase<typeof schema>,
  hash: string,
) {
  await db.run(`
    INSERT OR IGNORE INTO drizzle_migrations (hash, created_at)
    VALUES ('${hash}', CURRENT_TIMESTAMP)
  `);
}

export async function migrate(db: SqliteRemoteDatabase<typeof schema>) {
  console.log("🚀 Starting migration...");

  // Ensure migrations table exists
  await ensureMigrationsTable(db);

  // Get already executed migrations
  const executedHashes = await getMigratedHashes(db);

  // Filter and execute pending migrations
  const pendingMigrations = migrations.filter(
    (migration) => !executedHashes.includes(migration.hash),
  );

  if (pendingMigrations.length === 0) {
    console.log("✨ No pending migrations found.");
    return;
  }

  console.log(`📦 Found ${pendingMigrations.length} pending migrations`);

  // Execute migrations in sequence
  for (const migration of pendingMigrations) {
    console.log(`⚡ Executing migration: ${migration.hash}`);
    try {
      // Execute each SQL statement in sequence
      for (const sql of migration.sql) {
        await db.run(sql);
      }

      // Record successful migration
      await recordMigration(db, migration.hash);
      console.log(`✅ Successfully completed migration: ${migration.hash}`);
    } catch (error) {
      console.error(`❌ Failed to execute migration ${migration.hash}:`, error);
      throw error;
    }
  }

  console.log("🎉 All migrations completed");
}
