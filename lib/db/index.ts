import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema";

function createDb() {
  const pool = mysql.createPool({
    uri: process.env.DATABASE_URL!,
    charset: "utf8mb4",
  });
  return drizzle(pool, { schema, mode: "default" });
}

let _db: ReturnType<typeof createDb> | null = null;

export function getDb() {
  if (!_db) _db = createDb();
  return _db;
}
