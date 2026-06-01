# App Kelulusan

Aplikasi web full-stack untuk mengecek status kelulusan siswa. Siswa memasukkan NIM dan tanggal lahir, lalu sistem menampilkan status LULUS/TIDAK LULUS beserta pesan sesuai jenjang sekolah (TK/SD/SMP/SMA/SMK). Tersedia panel admin untuk mengelola data sekolah dan siswa, termasuk import massal via Excel.

## Fitur

- **Cek kelulusan** — input NIM + tanggal lahir, tampil hasil beserta pesan per jenjang
- **Admin panel** — kelola sekolah (dengan jenjang), tambah/edit/hapus siswa
- **Import Excel** — download template, isi data, upload sekaligus
- **Auth** — panel admin dilindungi password via environment variable

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 19 + TypeScript + React Router v7 |
| Build | Vite 8 + `@vitejs/plugin-react` |
| Styling | Tailwind CSS v4 |
| Backend | Express 5 (Node.js ESM) |
| Database | SQLite via `better-sqlite3` |

---

## Instalasi & Menjalankan Lokal

### Prasyarat

- **Node.js** v18 atau lebih baru
- **npm** v9+

### Langkah

```bash
# 1. Clone repo
git clone <url-repo>
cd app-kelulusan

# 2. Install semua dependency
npm install

# 3. Buat file environment
cp .env.example .env
# Edit .env — ganti ADMIN_PASSWORD sesuai keinginan
```

Isi `.env`:

```env
ADMIN_PASSWORD=gantiPasswordIni
PORT=3001
```

```bash
# 4. Jalankan dev server (frontend + backend sekaligus)
npm run dev
```

Akses aplikasi:

| URL | Keterangan |
|-----|------------|
| `http://localhost:5173` | Halaman cek kelulusan (siswa) |
| `http://localhost:5173/admin` | Panel admin |
| `http://localhost:3001` | REST API |

> **Catatan**: Database SQLite (`data.db`) dibuat otomatis di root project saat server pertama kali dijalankan. Schema migration juga berjalan otomatis.

### Script Lainnya

```bash
npm run build          # Build production (output: dist/)
npm run preview        # Preview hasil build
npm run lint           # Jalankan ESLint
npm run dev:client     # Hanya Vite (frontend)
npm run dev:server     # Hanya Express API
```

---

## Deploy ke Vercel (Full-stack dengan Turso)

Aplikasi ini siap di-deploy ke Vercel sebagai full-stack app: frontend React + backend Express sebagai serverless function, database menggunakan [Turso](https://turso.tech) (SQLite over HTTP).

### Langkah 1 — Buat database di Turso

```bash
# Install Turso CLI
brew install tursodatabase/tap/turso   # macOS
# atau: curl -sSfL https://get.tur.so/install.sh | bash

turso auth login
turso db create app-kelulusan
turso db show app-kelulusan   # catat URL
turso db tokens create app-kelulusan   # catat token
```

### Langkah 2 — Push repo ke GitHub

```bash
git add .
git commit -m "ready for vercel deploy"
git push
```

### Langkah 3 — Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) → **Add New Project** → import repo.
2. Vercel akan otomatis mendeteksi Vite. Biarkan setting default:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Tambahkan **Environment Variables**:
   | Variable | Value |
   |----------|-------|
   | `ADMIN_PASSWORD` | password admin production |
   | `TURSO_DATABASE_URL` | `libsql://nama-db-anda.turso.io` |
   | `TURSO_AUTH_TOKEN` | token dari langkah 1 |
4. Klik **Deploy**.

### Cara kerja di Vercel

- `vercel.json` me-rewrite semua request `/api/*` ke serverless function `api/index.ts`.
- Request selain `/api/*` (termasuk `/admin`) di-serve sebagai SPA (`index.html`), sehingga React Router menangani routing — **tidak ada lagi 404 saat akses `/admin` langsung**.
- `api/index.ts` meng-inisialisasi koneksi Turso lalu meneruskan request ke Express app.

### Opsi alternatif — Frontend di Vercel + Backend di Railway/Render

Jika tidak ingin menggunakan Turso, deploy backend ke [Railway](https://railway.app) atau [Render](https://render.com):

1. Set env vars di Railway: `ADMIN_PASSWORD`, `PORT=3001`.
2. Di `vite.config.ts`, tidak perlu perubahan untuk development.
3. Buat `.env.production` di root dengan `VITE_API_BASE=https://url-backend-kamu.railway.app` dan ubah semua fetch di frontend dari `'/api/...'` ke `` `${import.meta.env.VITE_API_BASE ?? ''}/api/...` ``.
4. Deploy frontend ke Vercel (tanpa `TURSO_*` env vars).

---

## Struktur Project

```
api/
  index.ts      # Vercel serverless entry point
server/
  index.ts      # Express REST API
  database.ts   # libsql/Turso init + schema migration
src/
  App.tsx       # Router setup
  pages/
    StudentPage.tsx   # Halaman publik cek kelulusan
    AdminPage.tsx     # Panel admin
  index.css     # Tailwind + design tokens
vercel.json      # Routing config (SPA + API)
data.db          # SQLite lokal (auto-generated, jangan di-commit)
.env             # Secrets (jangan di-commit)
```

Lihat [AGENTS.md](./AGENTS.md) untuk panduan lengkap bagi AI agent dan developer.
