import { createClient } from '@libsql/client'

const db = createClient({
  url: process.env.TURSO_DATABASE_URL ?? 'file:data.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
})

export async function initDB(): Promise<void> {
  await db.execute('PRAGMA foreign_keys = ON')
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS schools (
      id    TEXT PRIMARY KEY,
      name  TEXT NOT NULL,
      year  INTEGER NOT NULL,
      level TEXT NOT NULL DEFAULT 'SMP',
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
  // Migration: add level column if it doesn't exist yet (ignore if already present)
  try {
    await db.execute("ALTER TABLE schools ADD COLUMN level TEXT NOT NULL DEFAULT 'SMP'")
  } catch {
    // Column already exists — safe to ignore
  }
}

export default db
