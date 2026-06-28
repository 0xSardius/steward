import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

let _db: ReturnType<typeof drizzle<typeof schema>> | undefined;

/**
 * Lazily-created Drizzle client. Reuses a single postgres connection pool per process
 * (important for the worker, which is long-running).
 */
export function getDb(databaseUrl = process.env.DATABASE_URL) {
  if (!databaseUrl) throw new Error("DATABASE_URL is not set");
  if (!_db) {
    const sql = postgres(databaseUrl, { max: 10 });
    _db = drizzle(sql, { schema });
  }
  return _db;
}

export type Database = ReturnType<typeof getDb>;
