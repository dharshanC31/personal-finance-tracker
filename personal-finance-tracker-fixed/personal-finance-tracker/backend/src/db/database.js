import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url'; import sqlite3 from 'sqlite3'; import { open } from 'sqlite'; import { CREATE_CATEGORIES_TABLE, CREATE_TRANSACTIONS_TABLE, CREATE_INDEXES, DEFAULT_CATEGORIES } from './schema.js';
const __filename = fileURLToPath(import.meta.url); const __dirname = path.dirname(__filename);
const dbPath = process.env.DATABASE_PATH ? path.resolve(process.env.DATABASE_PATH) : path.resolve(__dirname, '../../data/finance.db');
let dbInstance = null;
export async function getDatabase() {
  if (!dbInstance) {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    dbInstance = await open({ filename: dbPath, driver: sqlite3.Database });
    await dbInstance.run('PRAGMA foreign_keys = ON;');
  }
  return dbInstance;
}
export async function initializeDatabase() {
  const db = await getDatabase();
  await db.exec(CREATE_CATEGORIES_TABLE); await db.exec(CREATE_TRANSACTIONS_TABLE); await db.exec(CREATE_INDEXES);
  for (const cat of DEFAULT_CATEGORIES) { await db.run(`INSERT OR IGNORE INTO categories (name, type) VALUES (?, ?)`, [cat.name, cat.type]); }
}