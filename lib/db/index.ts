import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema";

function createDb() {
  const pool = mysql.createPool({
    uri: process.env.DATABASE_URL!,
    charset: "utf8mb4",
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 20,
    idleTimeout: 30000, // close idle connections after 30 seconds
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  });

  // The DB host's session time_zone is 'SYSTEM', which resolves to
  // Bangladesh time, not UTC (confirmed via NOW() vs UTC_TIMESTAMP()). That
  // means CURRENT_TIMESTAMP and every TIMESTAMP column read/write is in
  // Dhaka wall-clock terms — but drizzle's timestamp column mapper always
  // appends "+0000" when parsing the raw value (see mysql-core/columns/
  // timestamp.js: `new Date(value + "+0000")`), i.e. it hard-assumes the DB
  // session is UTC. mysql2's own `timezone` client option can't fix this —
  // drizzle bypasses it entirely. Only pinning the actual session timezone
  // makes the two assumptions agree, so every new pooled connection gets it.
  pool.on("connection", (connection) => {
    connection.query("SET time_zone = '+00:00'");
  });

  return drizzle(pool, { schema, mode: "default" });
}

let _db: ReturnType<typeof createDb> | null = null;

export function getDb() {
  if (!_db) _db = createDb();
  return _db;
}
