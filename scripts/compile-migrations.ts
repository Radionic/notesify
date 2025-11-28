import { readMigrationFiles } from "drizzle-orm/migrator";
import fs from "fs";
import path from "path";

const migrations = readMigrationFiles({
  migrationsFolder: "./src/db/migrations",
});

await fs.writeFileSync(
  path.join(process.cwd(), "./src/db/migrations.json"),
  JSON.stringify(migrations),
);

console.log("Migrations compiled!");
