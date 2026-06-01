import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import db from './database.js'

const app = express()
const PORT = process.env.PORT || 3001
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }))
app.use(express.json())

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
app.get('/api/schools', (_req, res) => {
  res.json(db.prepare('SELECT * FROM schools ORDER BY name').all())
})

// ── Public: lookup student ───────────────────────────────────────────────────
app.post('/api/lookup', (req, res): void => {
  const { nim, birthDate } = req.body as { nim: string; birthDate: string }
  if (!nim?.trim() || !birthDate) {
    res.status(400).json({ error: 'NIM dan tanggal lahir wajib diisi' })
    return
  }
  const student = db
    .prepare(
      `SELECT s.*, sch.name AS school_name, sch.year AS school_year
       FROM students s
       JOIN schools sch ON s.school_id = sch.id
       WHERE s.nim = ? AND s.birth_date = ?`,
    )
    .get(nim.trim(), birthDate)

  if (!student) {
    res.status(404).json({
      error: 'Data tidak ditemukan. Periksa kembali NIM dan tanggal lahir Anda.',
    })
    return
  }
  res.json(student)
})

// ── Admin: verify password ───────────────────────────────────────────────────
app.post('/api/admin/verify', (req, res): void => {
  const { password } = req.body as { password: string }
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true })
  } else {
    res.status(401).json({ error: 'Password salah' })
  }
})

// ── Admin: list students ─────────────────────────────────────────────────────
app.get('/api/admin/students', requireAdmin, (req, res) => {
  const { schoolId } = req.query
  let query = `
    SELECT s.*, sch.name AS school_name
    FROM students s
    JOIN schools sch ON s.school_id = sch.id`
  const params: unknown[] = []
  if (schoolId) {
    query += ' WHERE s.school_id = ?'
    params.push(schoolId)
  }
  query += ' ORDER BY sch.name, s.nim'
  res.json(db.prepare(query).all(...params))
})

// ── Admin: add school ────────────────────────────────────────────────────────
app.post('/api/admin/schools', requireAdmin, (req, res): void => {
  const { id, name, year } = req.body as { id: string; name: string; year: number }
  if (!id?.trim() || !name?.trim() || !year) {
    res.status(400).json({ error: 'ID, nama, dan tahun wajib diisi' })
    return
  }
  try {
    db.prepare('INSERT INTO schools (id, name, year) VALUES (?, ?, ?)').run(
      id.trim().toUpperCase(),
      name.trim(),
      year,
    )
    res.json({ success: true })
  } catch (e: unknown) {
    const msg = (e as Error).message
    res.status(400).json({ error: msg.includes('UNIQUE') ? 'ID sekolah sudah digunakan' : msg })
  }
})

// ── Admin: delete school ─────────────────────────────────────────────────────
app.delete('/api/admin/schools/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM schools WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

// ── Admin: add student ───────────────────────────────────────────────────────
app.post('/api/admin/students', requireAdmin, (req, res): void => {
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
    db.prepare(
      'INSERT INTO students (nim, name, birth_date, school_id, is_graduated) VALUES (?, ?, ?, ?, ?)',
    ).run(nim.trim(), name.trim(), birthDate, schoolId, isGraduated ? 1 : 0)
    res.json({ success: true })
  } catch (e: unknown) {
    const msg = (e as Error).message
    res.status(400).json({
      error: msg.includes('UNIQUE') ? 'NIM sudah terdaftar di sekolah ini' : msg,
    })
  }
})

// ── Admin: update graduation status ─────────────────────────────────────────
app.put('/api/admin/students/:id', requireAdmin, (req, res) => {
  const { isGraduated } = req.body as { isGraduated: boolean }
  db.prepare('UPDATE students SET is_graduated = ? WHERE id = ?').run(
    isGraduated ? 1 : 0,
    req.params.id,
  )
  res.json({ success: true })
})

// ── Admin: delete student ────────────────────────────────────────────────────
app.delete('/api/admin/students/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id)
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

app.post('/api/admin/import/students', requireAdmin, (req, res): void => {
  const { rows } = req.body as { rows: ImportRow[] }
  if (!Array.isArray(rows) || rows.length === 0) {
    res.status(400).json({ error: 'Tidak ada data yang dikirim' })
    return
  }

  const validSchoolIds = new Set(
    (db.prepare('SELECT id FROM schools').all() as { id: string }[]).map((s) => s.id),
  )

  const insertStmt = db.prepare(
    'INSERT OR IGNORE INTO students (nim, name, birth_date, school_id, is_graduated) VALUES (?, ?, ?, ?, ?)',
  )

  let success = 0
  const failed: { row: number; nim: string; reason: string }[] = []

  const runImport = db.transaction(() => {
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

      const result = insertStmt.run(nim, name, birthDate, schoolId, isGraduated)
      if (result.changes > 0) success++
      else failed.push({ row: rowNum, nim, reason: 'NIM sudah terdaftar di sekolah ini (dilewati)' })
    }
  })

  try {
    runImport()
    res.json({ success, failed, total: rows.length })
  } catch (e: unknown) {
    res.status(500).json({ error: (e as Error).message })
  }
})

app.listen(PORT, () => {
  console.log(`✅  API running → http://localhost:${PORT}`)
})
