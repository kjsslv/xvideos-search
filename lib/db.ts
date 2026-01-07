import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'keywords.db');

// Augmented global type to prevent multiple existing connections during hot-reloads in dev
declare global {
    var sqlite: Database.Database | undefined;
}

const db = global.sqlite || new Database(DB_PATH);

if (process.env.NODE_ENV === 'development') {
    global.sqlite = db;
}

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Ensure table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS keywords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT UNIQUE NOT NULL
  )
`);

export default db;
