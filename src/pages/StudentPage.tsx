import { useState, useCallback } from 'react'

interface Student {
  id: number
  nim: string
  name: string
  birth_date: string
  school_name: string
  school_year: number
  school_level: string
  is_graduated: number
}

const LEVEL_LABEL: Record<string, string> = {
  TK: 'Taman Kanak-Kanak (TK)',
  SD: 'Sekolah Dasar (SD)',
  SMP: 'Sekolah Menengah Pertama (SMP)',
  'SMA/SMK': 'Sekolah Menengah Atas/Kejuruan (SMA/SMK)',
}

// ── CAPTCHA helpers ───────────────────────────────────────────────────────────
type CaptchaOp = '+' | '-' | '×'
interface Captcha { a: number; b: number; op: CaptchaOp; answer: number }

function generateCaptcha(): Captcha {
  const ops: CaptchaOp[] = ['+', '-', '×']
  const op = ops[Math.floor(Math.random() * ops.length)]
  let a: number, b: number, answer: number
  switch (op) {
    case '+':
      a = Math.floor(Math.random() * 20) + 1
      b = Math.floor(Math.random() * 20) + 1
      answer = a + b
      break
    case '-':
      a = Math.floor(Math.random() * 15) + 6
      b = Math.floor(Math.random() * (a - 1)) + 1
      answer = a - b
      break
    case '×':
      a = Math.floor(Math.random() * 9) + 2
      b = Math.floor(Math.random() * 9) + 2
      answer = a * b
      break
  }
  return { a, b, op, answer }
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function StudentPage() {
  const [nim, setNim] = useState('')
  const [birthDate, setBirthDate] = useState('')   // format dd-mm-yyyy
  const [birthDateError, setBirthDateError] = useState('')

  // CAPTCHA state
  const [captcha, setCaptcha] = useState<Captcha>(generateCaptcha)
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaError, setCaptchaError] = useState('')

  const [result, setResult] = useState<Student | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [phase, setPhase] = useState<'form' | 'result' | 'error'>('form')

  // Konversi dd-mm-yyyy → YYYY-MM-DD
  const toIsoDate = (dmy: string): string | null => {
    const m = dmy.match(/^(\d{2})-(\d{2})-(\d{4})$/)
    if (!m) return null
    return `${m[3]}-${m[2]}-${m[1]}`
  }

  // Auto-format input tanggal: sisipkan '-' otomatis
  const handleBirthDateChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8)
    let formatted = digits
    if (digits.length > 4) formatted = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`
    else if (digits.length > 2) formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`
    setBirthDate(formatted)
    setBirthDateError('')
  }

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha())
    setCaptchaInput('')
    // captchaError sengaja TIDAK di-reset di sini;
    // akan hilang sendiri saat user mulai mengetik (onChange)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validasi tanggal
    const isoDate = toIsoDate(birthDate)
    if (!isoDate) {
      setBirthDateError('Format tanggal harus dd-mm-yyyy (contoh: 15-01-2006)')
      return
    }

    // Validasi CAPTCHA
    const userAnswer = parseInt(captchaInput.trim(), 10)
    if (isNaN(userAnswer) || userAnswer !== captcha.answer) {
      refreshCaptcha()                                    // ganti soal, kosongkan input
      setCaptchaError('Jawaban salah, selesaikan soal baru di bawah.')  // set error SETELAH refresh
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nim, birthDate: isoDate }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Data tidak ditemukan')
        setPhase('error')
      } else {
        setResult(data)
        setPhase('result')
      }
    } catch {
      setError('Gagal terhubung ke server. Pastikan server API berjalan.')
      setPhase('error')
    } finally {
      setLoading(false)
      refreshCaptcha()
    }
  }

  const reset = () => {
    setPhase('form')
    setResult(null)
    setError('')
    setNim('')
    setBirthDate('')
    setBirthDateError('')
    refreshCaptcha()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0033] via-[#3b0070] to-[#1e004d] flex flex-col items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="fixed top-[-100px] right-[-100px] w-80 h-80 rounded-full bg-[var(--accent)] opacity-10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-80px] left-[-80px] w-64 h-64 rounded-full bg-purple-400 opacity-10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Cek Kelulusan</h1>
          <p className="text-purple-300 mt-1.5 text-sm">
            Masukkan data Anda untuk mengecek status kelulusan
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[var(--accent)] via-purple-400 to-indigo-500" />

          <div className="p-8">
            {phase === 'form' && (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* NIM */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    NIM / Nomor Induk Siswa
                  </label>
                  <input
                    type="text"
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    required
                    placeholder="Contoh: 2024001"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Birth date */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Tanggal Lahir
                  </label>
                  <input
                    type="text"
                    value={birthDate}
                    onChange={(e) => handleBirthDateChange(e.target.value)}
                    required
                    placeholder="dd-mm-yyyy"
                    maxLength={10}
                    className={`w-full border rounded-xl px-4 py-3 text-gray-900 placeholder-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      birthDateError ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  {birthDateError && (
                    <p className="text-red-500 text-xs mt-1.5">{birthDateError}</p>
                  )}
                </div>

                {/* CAPTCHA */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Verifikasi — Bukan Robot
                  </label>
                  <div className="flex items-center gap-3">
                    {/* Soal CAPTCHA */}
                    <div className="flex items-center gap-2 flex-1 bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 select-none">
                      <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="font-mono font-bold text-purple-700 text-base tracking-wide">
                        {captcha.a} {captcha.op} {captcha.b} = ?
                      </span>
                    </div>

                    {/* Input jawaban */}
                    <input
                      type="number"
                      value={captchaInput}
                      onChange={(e) => { setCaptchaInput(e.target.value); setCaptchaError('') }}
                      required
                      placeholder="Jawab"
                      className={`w-24 border rounded-xl px-3 py-3 text-center text-gray-900 font-semibold bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        captchaError ? 'border-red-400' : 'border-gray-200'
                      }`}
                    />

                    {/* Refresh soal */}
                    <button
                      type="button"
                      onClick={refreshCaptcha}
                      title="Ganti soal"
                      className="p-2.5 rounded-xl text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                  {captchaError && (
                    <p className="text-red-500 text-xs mt-1.5">{captchaError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-white text-sm tracking-wide transition-all active:scale-[0.98] disabled:opacity-60"
                  style={{ background: 'var(--accent)' }}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Mencari data…
                    </span>
                  ) : (
                    'Cek Kelulusan'
                  )}
                </button>
              </form>
            )}

            {phase === 'result' && result && (
              <div className="text-center">
                <div
                  className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${result.is_graduated ? 'bg-green-100' : 'bg-red-100'
                    }`}
                >
                  {result.is_graduated ? (
                    <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>

                <p className="text-sm text-gray-400 mb-1 font-medium uppercase tracking-widest">
                  Status Kelulusan
                </p>
                <h2
                  className={`text-3xl font-extrabold mb-3 ${result.is_graduated ? 'text-green-600' : 'text-red-600'
                    }`}
                >
                  {result.is_graduated ? 'LULUS' : 'TIDAK LULUS'}
                </h2>

                {/* Congratulatory / condolence message */}
                <div className={`rounded-xl px-4 py-3 mb-5 text-sm leading-relaxed ${result.is_graduated
                    ? 'bg-green-50 border border-green-100 text-green-800'
                    : 'bg-red-50 border border-red-100 text-red-800'
                  }`}>
                  {result.is_graduated
                    ? <>Selamat, Anda dinyatakan <strong>LULUS</strong> dari jenjang{' '}
                      <strong>{LEVEL_LABEL[result.school_level] ?? result.school_level}</strong> sesuai
                      dengan mekanisme dan kriteria yang berlaku.</>
                    : <>Mohon maaf, Anda dinyatakan <strong>TIDAK LULUS</strong> berdasarkan data
                      yang tersedia. Silakan hubungi pihak sekolah untuk informasi lebih lanjut.</>
                  }
                </div>

                <div className="bg-gray-50 rounded-2xl p-5 text-left space-y-3 border border-gray-100">
                  {[
                    { label: 'Nama', value: result.name },
                    { label: 'NIM', value: result.nim },
                    { label: 'Sekolah', value: result.school_name },
                    { label: 'Tahun', value: result.school_year },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-start gap-4">
                      <span className="text-gray-400 text-sm shrink-0">{label}</span>
                      <span className="font-semibold text-gray-800 text-sm text-right">{value}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={reset}
                  className="mt-6 w-full py-3 rounded-xl font-medium text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  ← Cek Lagi
                </button>
              </div>
            )}

            {phase === 'error' && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
                  <svg className="w-10 h-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-800 mb-1">Data Tidak Ditemukan</p>
                <p className="text-gray-500 text-sm leading-relaxed">{error}</p>
                <button
                  onClick={reset}
                  className="mt-6 w-full py-3 rounded-xl font-medium text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  ← Coba Lagi
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
