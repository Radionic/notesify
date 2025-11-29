import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

export default defineConfig({
  schema: "./src/db/schema",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
