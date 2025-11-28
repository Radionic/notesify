import Database from "@tauri-apps/plugin-sql";
import { drizzle, type SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import initSqlJs from "sql.js";
import { isTauri } from "@/lib/tauri";
import { migrate } from "./migrate";
import * as schema from "./schema";

let db: SqliteRemoteDatabase<typeof schema> | undefined;
let dbPromise: Promise<SqliteRemoteDatabase<typeof schema>> | undefined;

const isSelectQuery = (sql: string): boolean => {
  const selectRegex = /^\s*SELECT\b/i;
  return selectRegex.test(sql);
};

const initLocalDB = async () => {
  console.log("Creating local sqlite database");
  const sqlite = await Database.load("sqlite:notesify.db");

  const db = drizzle(
    async (sql, params, method) => {
      let rows: any = [];
      if (isSelectQuery(sql)) {
        rows = await sqlite.select(sql, params).catch((e) => {
          console.error("SQL Error:", e, sql);
          return [];
        });
        console.log("SQL Query Result:", rows);
      } else {
        rows = await sqlite.execute(sql, params).catch((e) => {
          console.error("SQL Error:", e, sql);
          return [];
        });
        console.log("SQL Execute Result:", rows);

        // sqlite.execute returns { lastInsertId?: number, rowsAffected: number }
        return { rows: [] };
      }

      rows = rows?.map((row: any) => {
        return Object.values(row);
      });
      rows = method === "all" ? rows : rows?.[0];
      return { rows };
    },
    { logger: true, schema },
  );

  await migrate(db);
  console.log("Created local sqlite database");
  return db;
};

const initWebDB = async () => {
  console.log("Creating web sqlite database");
  const SQL = await initSqlJs({
    locateFile: (file) => `/sql-wasm.wasm`,
  });

  // Create an in-memory SQLite database instance
  const dbInstance = new SQL.Database();

  const db = drizzle(
    async (sql, params, method) => {
      // Prepare the SQL statement with positional parameters
      const statement = dbInstance.prepare(sql);
      statement.bind(params);

      if (method === "run") {
        // For non-select queries (e.g., INSERT, UPDATE, DELETE), execute the statement
        statement.step();
        statement.free();
        return { rows: [] };
      } else {
        // For select queries (e.g., method 'all' or 'get'), collect the rows
        const rows = [];
        while (statement.step()) {
          rows.push(statement.get());
        }
        statement.free();

        // Return all rows for 'all', or the first row for 'get' or other methods
        const result = method === "all" ? rows : rows[0];
        return { rows: result };
      }
    },
    { logger: false, schema },
  );

  await migrate(db);
  console.log("Created web sqlite database");
  return db;
};

export const getDB = async () => {
  if (db) {
    return db;
  }

  if (!dbPromise) {
    dbPromise = isTauri ? initLocalDB() : initWebDB();
  }
  return await dbPromise;
};
