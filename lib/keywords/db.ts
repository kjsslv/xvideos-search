import Database from 'better-sqlite3';

// Singleton pattern for Next.js HMR
const singletonKey = Symbol.for('sqlite_db');
const globalObj = globalThis as unknown as { [singletonKey]: any };

// Assuming keywords.db is in the root directory
// When this code runs, process.cwd() is usually the project root in Next.js
const db = globalObj[singletonKey] || new Database('keywords.db');

if (process.env.NODE_ENV !== 'production') {
    globalObj[singletonKey] = db;
}

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create table if not exists with UNIQUE constraint on text
db.exec(`
  CREATE TABLE IF NOT EXISTS keywords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT UNIQUE NOT NULL
  )
`);

export default db;
