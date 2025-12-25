import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath =
  process.env.NODE_ENV === "production"
    ? "/var/data/chat.db" // Render persistent disk
    : path.join(process.cwd(), "data", "chat.db");


// Ensure data folder exists
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma("foreign_keys = ON");

db.prepare(`
  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversationId INTEGER NOT NULL,
    sender TEXT CHECK(sender IN ('user','ai')) NOT NULL,
    text TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversationId)
      REFERENCES conversations(id)
      ON DELETE CASCADE
  )
`).run();
