import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import type { ResultSet } from '@libsql/client'
import db, { initDB } from './database.js'

const app = express()
const PORT = process.env.PORT || 3001
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }))
app.use(express.json())

// ── Helper: convert libsql ResultSet rows to plain objects ───────────────────
type Rec = Record<string, unknown>
function rowsOf(r: ResultSet): Rec[] {
  return r.rows.map(row => Object.fromEntries(r.columns.map((col, i) => [col, row[i]])))
}
function rowOf(r: ResultSet): Rec | undefined {
  return rowsOf(r)[0]
}

// ── Auth middleware ──────────────────────────────────────────────────────────
const requireAdmin = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void => {
  if (req.headers['authorization'] !== `Bearer ${ADMIN_PASSWORD}`) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  next()
}

// ── Public: list schools ─────────────────────────────────────────────────────
app.get('/api/schools', async (_req, res) => {
  res.json(rowsOf(await db.execute('SELECT * FROM schools ORDER BY name')))
})

// ── Public: lookup student ───────────────────────────────────────────────────
app.post('/api/lookup', async (req, res): Promise<void> => {
  const { nim, birthDate } = req.body as { nim: string; birthDate: string }
  if (!nim?.trim() || !birthDate) {
    res.status(400).json({ error: 'NIM dan tanggal lahir wajib diisi' })
    return
  }
  const student = rowOf(
    await db.execute({
      sql: `SELECT s.*, sch.name AS school_name, sch.year AS school_year, sch.level AS school_level
       FROM students s
       JOIN schools sch ON s.school_id = sch.id
       WHERE s.nim = ? AND s.birth_date = ?`,
      args: [nim.trim(), birthDate],
    }),
  )

  if (!student) {
    res.status(404).json({
      error: 'Data tidak ditemukan. Periksa kembali NIM dan tanggal lahir Anda.',
    })
    return
  }
  res.json(student)
})

// ── Admin: verify password ───────────────────────────────────────────────────
app.post('/api/admin/verify', async (req, res): Promise<void> => {
  const { password } = req.body as { password: string }
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true })
  } else {
    res.status(401).json({ error: 'Password salah' })
  }
})

// ── Admin: list students ─────────────────────────────────────────────────────
app.get('/api/admin/students', requireAdmin, async (req, res) => {
  const { schoolId } = req.query
  let query = `
    SELECT s.*, sch.name AS school_name
    FROM students s
    JOIN schools sch ON s.school_id = sch.id`
  const args: unknown[] = []
  if (schoolId) {
    query += ' WHERE s.school_id = ?'
    args.push(schoolId)
  }
  query += ' ORDER BY sch.name, s.nim'
  res.json(rowsOf(await db.execute({ sql: query, args })))
})

// ── Admin: add school ────────────────────────────────────────────────────────
app.post('/api/admin/schools', requireAdmin, async (req, res): Promise<void> => {
  const { id, name, year, level } = req.body as { id: string; name: string; year: number; level: string }
  if (!id?.trim() || !name?.trim() || !year || !level) {
    res.status(400).json({ error: 'ID, nama, tahun, dan jenjang wajib diisi' })
    return
  }
  const validLevels = ['TK', 'SD', 'SMP', 'SMA/SMK']
  if (!validLevels.includes(level)) {
    res.status(400).json({ error: 'Jenjang tidak valid' })
    return
  }
  try {
    await db.execute({
      sql: 'INSERT INTO schools (id, name, year, level) VALUES (?, ?, ?, ?)',
      args: [id.trim().toUpperCase(), name.trim(), year, level],
    })
    res.json({ success: true })
  } catch (e: unknown) {
    const msg = (e as Error).message
    res.status(400).json({ error: msg.includes('UNIQUE') ? 'ID sekolah sudah digunakan' : msg })
  }
})

// ── Admin: update school ────────────────────────────────────────────────────
app.put('/api/admin/schools/:id', requireAdmin, async (req, res): Promise<void> => {
  const { name, year, level } = req.body as { name: string; year: number; level: string }
  if (!name?.trim() || !year || !level) {
    res.status(400).json({ error: 'Nama, tahun, dan jenjang wajib diisi' })
    return
  }
  const validLevels = ['TK', 'SD', 'SMP', 'SMA/SMK']
  if (!validLevels.includes(level)) {
    res.status(400).json({ error: 'Jenjang tidak valid' })
    return
  }
  await db.execute({
    sql: 'UPDATE schools SET name = ?, year = ?, level = ? WHERE id = ?',
    args: [name.trim(), year, level, req.params.id],
  })
  res.json({ success: true })
})

// ── Admin: delete school ─────────────────────────────────────────────────────
app.delete('/api/admin/schools/:id', requireAdmin, async (req, res) => {
  await db.execute({ sql: 'DELETE FROM schools WHERE id = ?', args: [req.params.id] })
  res.json({ success: true })
})

// ── Admin: add student ───────────────────────────────────────────────────────
app.post('/api/admin/students', requireAdmin, async (req, res): Promise<void> => {
  const { nim, name, birthDate, schoolId, isGraduated } = req.body as {
    nim: string
    name: string
    birthDate: string
    schoolId: string
    isGraduated: boolean
  }
  if (!nim?.trim() || !name?.trim() || !birthDate || !schoolId) {
    res.status(400).json({ error: 'Semua field wajib diisi' })
    return
  }
  try {
    await db.execute({
      sql: 'INSERT INTO students (nim, name, birth_date, school_id, is_graduated) VALUES (?, ?, ?, ?, ?)',
      args: [nim.trim(), name.trim(), birthDate, schoolId, isGraduated ? 1 : 0],
    })
    res.json({ success: true })
  } catch (e: unknown) {
    const msg = (e as Error).message
    res.status(400).json({
      error: msg.includes('UNIQUE') ? 'NIM sudah terdaftar di sekolah ini' : msg,
    })
  }
})

// ── Admin: update student (full edit or quick graduation toggle) ─────────────
app.put('/api/admin/students/:id', requireAdmin, async (req, res): Promise<void> => {
  const { isGraduated, nim, name, birthDate, schoolId } = req.body as {
    isGraduated: boolean; nim?: string; name?: string; birthDate?: string; schoolId?: string
  }
  if (nim !== undefined) {
    // Full update
    if (!nim?.trim() || !name?.trim() || !birthDate || !schoolId) {
      res.status(400).json({ error: 'Semua field wajib diisi' })
      return
    }
    try {
      await db.execute({
        sql: 'UPDATE students SET nim = ?, name = ?, birth_date = ?, school_id = ?, is_graduated = ? WHERE id = ?',
        args: [nim.trim(), name.trim(), birthDate, schoolId, isGraduated ? 1 : 0, req.params.id],
      })
      res.json({ success: true })
    } catch (e: unknown) {
      const msg = (e as Error).message
      res.status(400).json({ error: msg.includes('UNIQUE') ? 'NIM sudah terdaftar di sekolah ini' : msg })
    }
  } else {
    // Quick graduation toggle
    await db.execute({
      sql: 'UPDATE students SET is_graduated = ? WHERE id = ?',
      args: [isGraduated ? 1 : 0, req.params.id],
    })
    res.json({ success: true })
  }
})

// ── Admin: delete student ────────────────────────────────────────────────────
app.delete('/api/admin/students/:id', requireAdmin, async (req, res) => {
  await db.execute({ sql: 'DELETE FROM students WHERE id = ?', args: [req.params.id] })
  res.json({ success: true })
})

// ── Admin: bulk import students from parsed Excel rows ───────────────────────
interface ImportRow {
  nim: string
  name: string
  birthDate: string
  schoolId: string
  isGraduated: boolean
}

app.post('/api/admin/import/students', requireAdmin, async (req, res): Promise<void> => {
  const { rows } = req.body as { rows: ImportRow[] }
  if (!Array.isArray(rows) || rows.length === 0) {
    res.status(400).json({ error: 'Tidak ada data yang dikirim' })
    return
  }

  const validSchoolIds = new Set(
    rowsOf(await db.execute('SELECT id FROM schools')).map((s) => s.id as string),
  )

  let success = 0
  const failed: { row: number; nim: string; reason: string }[] = []

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const rowNum = i + 2 // Excel row (1 = header)
    const nim = String(r.nim ?? '').trim()
    const name = String(r.name ?? '').trim()
    const birthDate = String(r.birthDate ?? '').trim()
    const schoolId = String(r.schoolId ?? '').trim().toUpperCase()
    const isGraduated = r.isGraduated ? 1 : 0

    if (!nim) { failed.push({ row: rowNum, nim: '-', reason: 'NIM kosong' }); continue }
    if (!name) { failed.push({ row: rowNum, nim, reason: 'Nama kosong' }); continue }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      failed.push({ row: rowNum, nim, reason: `Format tanggal lahir salah: "${birthDate}" (harus YYYY-MM-DD)` })
      continue
    }
    if (!validSchoolIds.has(schoolId)) {
      failed.push({ row: rowNum, nim, reason: `ID Sekolah "${schoolId}" tidak ditemukan` })
      continue
    }

    const result = await db.execute({
      sql: 'INSERT OR IGNORE INTO students (nim, name, birth_date, school_id, is_graduated) VALUES (?, ?, ?, ?, ?)',
      args: [nim, name, birthDate, schoolId, isGraduated],
    })
    if (result.rowsAffected > 0) success++
    else failed.push({ row: rowNum, nim, reason: 'NIM sudah terdaftar di sekolah ini (dilewati)' })
  }

  res.json({ success, failed, total: rows.length })
})

// Start server only when running locally (not as Vercel serverless function)
if (!process.env.VERCEL) {
  initDB()
    .then(() => app.listen(PORT, () => console.log(`✅  API running → http://localhost:${PORT}`)))
    .catch((err: unknown) => { console.error('DB init failed:', err); process.exit(1) })
}

export default app
