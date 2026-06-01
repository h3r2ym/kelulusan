# App Kelulusan — Agent Instructions

Aplikasi web full-stack untuk mengecek status kelulusan siswa. Siswa memasukkan **NIM** dan **tanggal lahir**; sistem menampilkan status LULUS/TIDAK LULUS beserta pesan sesuai jenjang sekolah. Admin dapat mengelola data sekolah dan siswa via panel admin yang dilindungi password.

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 19 + TypeScript, React Router v7 |
| Build tool | Vite 8 + `@vitejs/plugin-react` |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Backend | Express 5 + `tsx watch` (Node ESM) |
| Database | SQLite via `better-sqlite3` → `data.db` |
| Excel | `xlsx` (SheetJS CE) — client-side only |

## Commands

```bash
npm install            # install semua dependency
cp .env.example .env  # buat file env (lalu edit passwordnya)
npm run dev            # vite (port 5173) + tsx watch server (port 3001) secara bersamaan
npm run dev:client     # hanya frontend
npm run dev:server     # hanya backend
npm run build          # tsc -b && vite build
npm run lint           # eslint
npm run preview        # preview production build
```

## Project Structure

```
server/
  index.ts      # Express REST API (semua endpoint /api/...)
  database.ts   # inisialisasi SQLite + schema migration
data.db          # SQLite database (dibuat otomatis saat server pertama kali jalan)
src/
  App.tsx       # root component + React Router setup
  index.css     # Tailwind import + CSS custom properties (design tokens)
  main.tsx      # React DOM entry point
  pages/
    StudentPage.tsx   # halaman publik: form cek kelulusan + hasil
    AdminPage.tsx     # admin dashboard: login, kelola sekolah & siswa, import Excel
  assets/
.env            # ADMIN_PASSWORD, PORT (tidak di-commit)
```

## API Endpoints

| Method | Path | Auth | Keterangan |
|--------|------|------|------------|
| GET | `/api/schools` | — | List semua sekolah |
| POST | `/api/lookup` | — | Cek kelulusan `{ nim, birthDate }` |
| POST | `/api/admin/verify` | — | Cek password admin |
| GET | `/api/admin/students` | ✓ | List siswa (opsional `?schoolId=`) |
| POST | `/api/admin/schools` | ✓ | Tambah sekolah |
| PUT | `/api/admin/schools/:id` | ✓ | Update sekolah (name, year, level) |
| DELETE | `/api/admin/schools/:id` | ✓ | Hapus sekolah + siswa terkait |
| POST | `/api/admin/students` | ✓ | Tambah siswa |
| PUT | `/api/admin/students/:id` | ✓ | Update siswa (full) atau toggle kelulusan |
| DELETE | `/api/admin/students/:id` | ✓ | Hapus siswa |
| POST | `/api/admin/import/students` | ✓ | Bulk import dari parsed Excel rows |

Auth header: `Authorization: Bearer <ADMIN_PASSWORD>`

## Data Model

```ts
interface School {
  id: string       // PK, uppercase, tanpa spasi
  name: string
  year: number     // tahun kelulusan
  level: string    // 'TK' | 'SD' | 'SMP' | 'SMA/SMK'
}

interface Student {
  id: number
  nim: string
  name: string
  birth_date: string   // 'YYYY-MM-DD'
  school_id: string    // FK → schools.id
  is_graduated: number // 0 | 1
}
```

## Styling Conventions

- Tailwind v4: **tidak ada `tailwind.config.js`**. Konfigurasi via CSS di `src/index.css`.
- Import: `@import "tailwindcss";` (bukan `@tailwind base/components/utilities`)
- CSS custom properties (design tokens) di `src/index.css`:
  - `--accent: #aa3bff` — warna utama
  - `--text`, `--text-h`, `--bg`, `--border` — warna teks & layout
- Gunakan Tailwind utilities untuk layout/spacing; gunakan `var(--token)` untuk warna brand.
- Tailwind v4 lint hint: `bg-gradient-to-br` → `bg-linear-to-br`, `from-[var(--x)]` → `from-(--x)` — **abaikan saja**, tidak mempengaruhi runtime.

## Pitfalls & Notes

- **ESM**: `package.json` punya `"type": "module"`. Server pakai `import.meta.url` untuk `__dirname` equivalent.
- **Proxy**: Vite proxy `/api` → `http://localhost:3001` (lihat `vite.config.ts`). Tidak perlu CORS di dev.
- **xlsx vulnerability**: `xlsx` punya known prototype pollution vulnerability. Sudah di-scope ke client-only (parsing di browser, tidak di server). Jangan parse file Excel di server.
- **Schema migration**: `database.ts` jalankan `ALTER TABLE` otomatis jika kolom `level` belum ada di tabel `schools` yang sudah existing.
- **Auth**: Password admin di-set via `ADMIN_PASSWORD` di `.env`. Default fallback `'admin123'` — **ganti di production**.
- **`data.db`**: Harus ada di server saat runtime. Untuk Vercel/serverless, lihat bagian deploy.

## Core UI Flow

1. Siswa buka `/` → isi NIM + tanggal lahir → klik Cek
2. Frontend `POST /api/lookup` → tampilkan hasil LULUS/TIDAK LULUS + pesan per jenjang
3. Admin buka `/admin` → login dengan password → kelola sekolah & siswa
4. Import massal via Excel: download template → isi data → upload (parse client-side → kirim JSON ke server)

