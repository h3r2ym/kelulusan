import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.join(__dirname, '..', 'data.db'))

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS schools (
    id   TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    year INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS students (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    nim          TEXT NOT NULL,
    name         TEXT NOT NULL,
    birth_date   TEXT NOT NULL,
    school_id    TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    is_graduated INTEGER NOT NULL DEFAULT 0,
    created_at   TEXT DEFAULT (datetime('now', 'localtime')),
    UNIQUE(nim, school_id)
  );
`)

export default db
