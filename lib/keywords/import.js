const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Adjusted path: lib/keywords/import.js -> ../../keywords.db
const DB_PATH = path.join(__dirname, '../../keywords.db');
const KEYWORDS_DIR = path.join(__dirname, 'data');

// Ensure DB is initialized
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS keywords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT UNIQUE NOT NULL
  )
`);

// Prepare insert statement (INSERT OR IGNORE handles duplicates)
const insert = db.prepare('INSERT OR IGNORE INTO keywords (text) VALUES (?)');

function importKeywords() {
    if (!fs.existsSync(KEYWORDS_DIR)) {
        console.error(`Directory not found: ${KEYWORDS_DIR}`);
        console.log('Please create the directory and add .txt files.');
        return;
    }

    const files = fs.readdirSync(KEYWORDS_DIR).filter(file => file.endsWith('.txt'));

    if (files.length === 0) {
        console.log('No .txt files found in lib/keywords/data/');
        return;
    }

    let totalImported = 0;
    let totalSkipped = 0;

    const importTransaction = db.transaction((lines) => {
        for (const line of lines) {
            const cleanLine = line.trim();
            if (cleanLine) {
                const info = insert.run(cleanLine);
                if (info.changes > 0) {
                    totalImported++;
                } else {
                    totalSkipped++;
                }
            }
        }
    });

    for (const file of files) {
        console.log(`Processing: ${file}`);
        const filePath = path.join(KEYWORDS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        importTransaction(lines);
    }

    console.log('-----------------------------------');
    console.log(`Import Complete!`);
    console.log(`New keywords added: ${totalImported}`);
    console.log(`Duplicates skipped: ${totalSkipped}`);
    console.log('-----------------------------------');
}

importKeywords();
