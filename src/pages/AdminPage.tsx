import { useState, useEffect, useCallback, useRef } from 'react'
import * as xlsx from 'xlsx'

interface School { id: string; name: string; year: number }
interface Student {
  id: number; nim: string; name: string; birth_date: string
  school_id: string; school_name: string; is_graduated: number
}

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: 'ok' | 'err' }) {
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-white text-sm font-medium animate-fade-in
      ${type === 'ok' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'ok'
        ? <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
        : <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
      }
      {msg}
    </div>
  )
}

// ── Login screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (pw: string) => Promise<string | null> }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setErr('')
    const error = await onLogin(pw)
    if (error) { setErr(error); setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0033] via-[#3b0070] to-[#1e004d] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/20 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-purple-300 text-sm mt-1">Masuk untuk mengelola data kelulusan</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[var(--accent)] via-purple-400 to-indigo-500" />
          <form onSubmit={submit} className="p-8 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Password Admin
              </label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  required
                  placeholder="Masukkan password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show
                    ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
              {err && <p className="text-red-500 text-xs mt-2">{err}</p>}
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-sm disabled:opacity-60 transition-all active:scale-[0.98]"
              style={{ background: 'var(--accent)' }}>
              {loading ? 'Memverifikasi…' : 'Masuk'}
            </button>
          </form>
        </div>
        <p className="text-center mt-5 text-xs">
          <a href="/" className="text-purple-400 hover:text-purple-200 transition-colors">← Halaman Siswa</a>
        </p>
      </div>
    </div>
  )
}

// ── Main admin dashboard ──────────────────────────────────────────────────────
export default function AdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem('admin_token') ?? '')
  const [tab, setTab] = useState<'students' | 'schools'>('students')
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  // Schools state
  const [schools, setSchools] = useState<School[]>([])
  const [schoolForm, setSchoolForm] = useState({ id: '', name: '', year: String(new Date().getFullYear()) })
  const [schoolLoading, setSchoolLoading] = useState(false)

  // Students state
  const [students, setStudents] = useState<Student[]>([])
  const [filterSchool, setFilterSchool] = useState('')
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [studentForm, setStudentForm] = useState({
    nim: '', name: '', birthDate: '', schoolId: '', isGraduated: false,
  })
  const [studentLoading, setStudentLoading] = useState(false)

  // Import state
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: number
    failed: { row: number; nim: string; reason: string }[]
    total: number
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadSchools = useCallback(async () => {
    const res = await fetch('/api/schools')
    if (res.ok) setSchools(await res.json())
  }, [])

  const loadStudents = useCallback(async () => {
    const url = filterSchool
      ? `/api/admin/students?schoolId=${filterSchool}`
      : '/api/admin/students'
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) setStudents(await res.json())
  }, [token, filterSchool])

  useEffect(() => {
    if (token) { loadSchools(); loadStudents() }
  }, [token, loadSchools, loadStudents])

  // Login
  const handleLogin = async (pw: string): Promise<string | null> => {
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    })
    if (res.ok) {
      sessionStorage.setItem('admin_token', pw)
      setToken(pw)
      return null
    }
    const d = await res.json()
    return d.error || 'Login gagal'
  }

  const logout = () => {
    sessionStorage.removeItem('admin_token')
    setToken('')
    setStudents([])
    setSchools([])
  }

  // ── School handlers ────────────────────────────────────────────────────────
  const addSchool = async (e: React.FormEvent) => {
    e.preventDefault()
    setSchoolLoading(true)
    const res = await fetch('/api/admin/schools', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ ...schoolForm, year: Number(schoolForm.year) }),
    })
    const d = await res.json()
    setSchoolLoading(false)
    if (res.ok) {
      showToast('Sekolah berhasil ditambahkan')
      setSchoolForm({ id: '', name: '', year: String(new Date().getFullYear()) })
      loadSchools()
    } else {
      showToast(d.error, 'err')
    }
  }

  const deleteSchool = async (id: string) => {
    if (!confirm(`Hapus sekolah "${id}"? Semua data siswa di sekolah ini juga akan terhapus.`)) return
    const res = await fetch(`/api/admin/schools/${id}`, { method: 'DELETE', headers: authHeaders })
    if (res.ok) { showToast('Sekolah dihapus'); loadSchools(); loadStudents() }
  }

  // ── Student handlers ───────────────────────────────────────────────────────
  const addStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setStudentLoading(true)
    const res = await fetch('/api/admin/students', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(studentForm),
    })
    const d = await res.json()
    setStudentLoading(false)
    if (res.ok) {
      showToast('Siswa berhasil ditambahkan')
      setStudentForm({ nim: '', name: '', birthDate: '', schoolId: '', isGraduated: false })
      setShowAddStudent(false)
      loadStudents()
    } else {
      showToast(d.error, 'err')
    }
  }

  const toggleGraduation = async (student: Student) => {
    const res = await fetch(`/api/admin/students/${student.id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ isGraduated: !student.is_graduated }),
    })
    if (res.ok) {
      showToast(`Status ${student.name} diperbarui`)
      loadStudents()
    }
  }

  const deleteStudent = async (student: Student) => {
    if (!confirm(`Hapus siswa "${student.name}" (${student.nim})?`)) return
    const res = await fetch(`/api/admin/students/${student.id}`, {
      method: 'DELETE', headers: authHeaders,
    })
    if (res.ok) { showToast('Siswa dihapus'); loadStudents() }
  }

  // ── Excel template download (client-side generation) ────────────────────────
  const downloadTemplate = () => {
    const wb = xlsx.utils.book_new()

    // Sheet 1: student import template
    const ws1 = xlsx.utils.aoa_to_sheet([
      ['NIM', 'Nama Lengkap', 'Tanggal Lahir (YYYY-MM-DD)', 'ID Sekolah', 'Status Lulus (1=Lulus / 0=Tidak Lulus)'],
      ['2024001', 'Budi Santoso', '2006-01-15', schools[0]?.id ?? 'ID_SEKOLAH', 1],
    ])
    ws1['!cols'] = [{ wch: 15 }, { wch: 28 }, { wch: 28 }, { wch: 16 }, { wch: 38 }]
    xlsx.utils.book_append_sheet(wb, ws1, 'Data Siswa')

    // Sheet 2: master school reference
    const schoolRows = schools.map((s) => [s.id, s.name, s.year])
    const ws2 = xlsx.utils.aoa_to_sheet([
      ['ID Sekolah', 'Nama Sekolah', 'Tahun'],
      ...schoolRows,
    ])
    ws2['!cols'] = [{ wch: 16 }, { wch: 40 }, { wch: 10 }]
    xlsx.utils.book_append_sheet(wb, ws2, 'Master Sekolah')

    xlsx.writeFile(wb, 'template-import-siswa.xlsx')
  }

  // ── Excel import (client-side parse → send JSON to server) ──────────────────
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportResult(null)

    try {
      const buf = await file.arrayBuffer()
      const wb = xlsx.read(buf, { type: 'array', cellDates: true })
      const ws = wb.Sheets['Data Siswa']
      if (!ws) {
        showToast('Sheet "Data Siswa" tidak ditemukan dalam file', 'err')
        return
      }

      const rawRows = xlsx.utils.sheet_to_json<Record<string, unknown>>(ws)
      const rows = rawRows.map((r) => {
        const rawDate = r['Tanggal Lahir (YYYY-MM-DD)']
        let birthDate = ''
        if (rawDate instanceof Date) {
          birthDate = rawDate.toISOString().split('T')[0]
        } else {
          birthDate = String(rawDate ?? '').trim()
        }
        const statusRaw = r['Status Lulus (1=Lulus / 0=Tidak Lulus)']
        return {
          nim: String(r['NIM'] ?? '').trim(),
          name: String(r['Nama Lengkap'] ?? '').trim(),
          birthDate,
          schoolId: String(r['ID Sekolah'] ?? '').trim().toUpperCase(),
          isGraduated: Number(statusRaw) === 1,
        }
      })

      const res = await fetch('/api/admin/import/students', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ rows }),
      })
      const d = await res.json()
      if (res.ok) {
        setImportResult(d)
        if (d.success > 0) { showToast(`${d.success} siswa berhasil diimport`); loadStudents() }
        else showToast('Tidak ada data baru yang diimport', 'err')
      } else {
        showToast(d.error, 'err')
      }
    } catch {
      showToast('Gagal membaca file Excel', 'err')
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ── Render: login ──────────────────────────────────────────────────────────
  if (!token) return <LoginScreen onLogin={handleLogin} />

  // ── Render: dashboard ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 14l9-5-9-5-9 5 9 5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">Admin Panel</p>
              <p className="text-xs text-gray-400 leading-none mt-0.5">Manajemen Kelulusan</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-gray-500 hover:text-gray-800 transition-colors hidden sm:block">
              ← Halaman Siswa
            </a>
            <button onClick={logout}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-200 mb-6 w-fit">
          {(['students', 'schools'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t
                  ? 'text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              style={tab === t ? { background: 'var(--accent)' } : {}}>
              {t === 'students' ? `Siswa (${students.length})` : `Sekolah (${schools.length})`}
            </button>
          ))}
        </div>

        {/* ── Students tab ── */}
        {tab === 'students' && (
          <div className="space-y-5">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select value={filterSchool} onChange={(e) => setFilterSchool(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white text-gray-700 appearance-none pr-9 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option value="">Semua Sekolah</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {/* Download template */}
                <button onClick={downloadTemplate} disabled={schools.length === 0}
                  title={schools.length === 0 ? 'Tambahkan sekolah terlebih dahulu' : 'Download template Excel'}
                  className="flex items-center gap-2 text-sm font-semibold text-emerald-700 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Template
                </button>

                {/* Import Excel */}
                <label className={`flex items-center gap-2 text-sm font-semibold text-blue-700 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all cursor-pointer active:scale-[0.98] ${importing ? 'opacity-60 pointer-events-none' : ''}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {importing ? 'Mengimport…' : 'Import Excel'}
                  <input ref={fileInputRef} type="file" accept=".xlsx,.xls"
                    className="hidden" onChange={handleImportFile} disabled={importing} />
                </label>

                {/* Add manually */}
                <button onClick={() => setShowAddStudent(true)}
                  className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-xl transition-all active:scale-[0.98]"
                  style={{ background: 'var(--accent)' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah Siswa
                </button>
              </div>
            </div>

            {/* Import result card */}
            {importResult && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 text-sm">Hasil Import</h3>
                  <button onClick={() => setImportResult(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
                </div>
                <div className="p-5">
                  <div className="flex gap-3 mb-4">
                    <div className="flex-1 bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-center">
                      <div className="text-2xl font-bold text-green-700">{importResult.success}</div>
                      <div className="text-xs text-green-600 mt-0.5 font-medium">Berhasil</div>
                    </div>
                    <div className="flex-1 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-center">
                      <div className="text-2xl font-bold text-red-700">{importResult.failed.length}</div>
                      <div className="text-xs text-red-600 mt-0.5 font-medium">Gagal/Lewat</div>
                    </div>
                    <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-center">
                      <div className="text-2xl font-bold text-gray-700">{importResult.total}</div>
                      <div className="text-xs text-gray-500 mt-0.5 font-medium">Total Baris</div>
                    </div>
                  </div>
                  {importResult.failed.length > 0 && (
                    <div className="max-h-44 overflow-y-auto rounded-xl border border-gray-100">
                      <table className="w-full text-xs">
                        <thead className="sticky top-0 bg-gray-50">
                          <tr>
                            <th className="text-left px-3 py-2 text-gray-500 font-semibold">Baris</th>
                            <th className="text-left px-3 py-2 text-gray-500 font-semibold">NIM</th>
                            <th className="text-left px-3 py-2 text-gray-500 font-semibold">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {importResult.failed.map((f, i) => (
                            <tr key={i}>
                              <td className="px-3 py-2 text-gray-400">{f.row}</td>
                              <td className="px-3 py-2 font-mono text-gray-700">{f.nim}</td>
                              <td className="px-3 py-2 text-red-600">{f.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add student form */}
            {showAddStudent && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Tambah Siswa Baru</h3>
                  <button onClick={() => setShowAddStudent(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={addStudent} className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">NIM</label>
                      <input value={studentForm.nim} onChange={(e) => setStudentForm(f => ({ ...f, nim: e.target.value }))}
                        required placeholder="2024001"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                      <input value={studentForm.name} onChange={(e) => setStudentForm(f => ({ ...f, name: e.target.value }))}
                        required placeholder="John Doe"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tanggal Lahir</label>
                      <input type="date" value={studentForm.birthDate} onChange={(e) => setStudentForm(f => ({ ...f, birthDate: e.target.value }))}
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Sekolah</label>
                      <div className="relative">
                        <select value={studentForm.schoolId} onChange={(e) => setStudentForm(f => ({ ...f, schoolId: e.target.value }))}
                          required
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 appearance-none pr-9 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                          <option value="">— Pilih —</option>
                          {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer"
                          checked={studentForm.isGraduated}
                          onChange={(e) => setStudentForm(f => ({ ...f, isGraduated: e.target.checked }))} />
                        <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
                      </label>
                      <span className="text-sm font-medium text-gray-700">Tandai sebagai Lulus</span>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button type="submit" disabled={studentLoading}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-all active:scale-[0.98]"
                      style={{ background: 'var(--accent)' }}>
                      {studentLoading ? 'Menyimpan…' : 'Simpan Siswa'}
                    </button>
                    <button type="button" onClick={() => setShowAddStudent(false)}
                      className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Students table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {students.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="font-medium">Belum ada data siswa</p>
                  <p className="text-sm mt-1">Tambahkan siswa dengan tombol di atas</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {['NIM', 'Nama', 'Tgl Lahir', 'Sekolah', 'Status', 'Aksi'].map((h) => (
                          <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {students.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3.5 font-mono text-gray-700 text-xs">{s.nim}</td>
                          <td className="px-4 py-3.5 font-medium text-gray-900 whitespace-nowrap">{s.name}</td>
                          <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{s.birth_date}</td>
                          <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{s.school_name}</td>
                          <td className="px-4 py-3.5">
                            <button onClick={() => toggleGraduation(s)}
                              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                                s.is_graduated
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}>
                              {s.is_graduated
                                ? <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Lulus</>
                                : <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg> Tidak Lulus</>
                              }
                            </button>
                          </td>
                          <td className="px-4 py-3.5">
                            <button onClick={() => deleteStudent(s)}
                              className="text-gray-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Schools tab ── */}
        {tab === 'schools' && (
          <div className="space-y-5">
            {/* Add school form */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Tambah Sekolah</h3>
              </div>
              <form onSubmit={addSchool} className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">ID Sekolah</label>
                    <input value={schoolForm.id} onChange={(e) => setSchoolForm(f => ({ ...f, id: e.target.value }))}
                      required placeholder="SMAN1JKT"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 uppercase focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    <p className="text-xs text-gray-400 mt-1">Huruf kapital, tanpa spasi</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nama Sekolah</label>
                    <input value={schoolForm.name} onChange={(e) => setSchoolForm(f => ({ ...f, name: e.target.value }))}
                      required placeholder="SMA Negeri 1 Jakarta"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tahun Kelulusan</label>
                    <input type="number" value={schoolForm.year} onChange={(e) => setSchoolForm(f => ({ ...f, year: e.target.value }))}
                      required min="2000" max="2100"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                  </div>
                </div>
                <button type="submit" disabled={schoolLoading}
                  className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-all active:scale-[0.98]"
                  style={{ background: 'var(--accent)' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  {schoolLoading ? 'Menyimpan…' : 'Tambah Sekolah'}
                </button>
              </form>
            </div>

            {/* Schools table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {schools.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                  <p className="font-medium">Belum ada sekolah terdaftar</p>
                  <p className="text-sm mt-1">Tambahkan sekolah menggunakan form di atas</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {['ID', 'Nama Sekolah', 'Tahun', 'Jumlah Siswa', 'Aksi'].map((h) => (
                          <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {schools.map((sc) => {
                        const count = students.filter(s => s.school_id === sc.id).length
                        return (
                          <tr key={sc.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3.5">
                              <span className="font-mono text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-md">{sc.id}</span>
                            </td>
                            <td className="px-4 py-3.5 font-medium text-gray-900">{sc.name}</td>
                            <td className="px-4 py-3.5 text-gray-600">{sc.year}</td>
                            <td className="px-4 py-3.5">
                              <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                                {count} siswa
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <button onClick={() => deleteSchool(sc.id)}
                                className="text-gray-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
