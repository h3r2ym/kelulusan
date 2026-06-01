import { useState } from 'react'

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

export default function StudentPage() {
  const [nim, setNim] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [result, setResult] = useState<Student | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [phase, setPhase] = useState<'form' | 'result' | 'error'>('form')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nim, birthDate }),
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
    }
  }

  const reset = () => {
    setPhase('form')
    setResult(null)
    setError('')
    setNim('')
    setBirthDate('')
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
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
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
