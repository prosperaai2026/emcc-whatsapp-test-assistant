import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DATABASE_PATH || './data/church.db';
const dir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db: import('better-sqlite3').Database = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export default db;