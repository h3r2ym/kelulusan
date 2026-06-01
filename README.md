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

## Deploy ke Vercel

> **Penting**: Vercel adalah platform *serverless* dan **tidak mendukung SQLite** (`data.db`) secara native karena filesystem-nya bersifat read-only dan ephemeral. Untuk deploy penuh ke Vercel, database perlu dipindahkan ke layanan eksternal seperti [Turso](https://turso.tech) (SQLite over HTTP) atau [PlanetScale](https://planetscale.com) / [Neon](https://neon.tech) (PostgreSQL).
>
> Panduan ini menjelaskan cara deploy **frontend saja** ke Vercel dengan API di-host terpisah (misalnya Railway, Render, atau VPS).

### Opsi 1 — Frontend di Vercel + Backend di Railway/Render

#### A. Deploy Backend (Railway / Render)

1. Push repo ke GitHub.
2. Buat project baru di [Railway](https://railway.app) atau [Render](https://render.com).
3. Pilih repo, set **start command**: `node --loader tsx server/index.ts` atau build dulu dengan `tsc` lalu `node dist-server/index.js`.
4. Set environment variables:
   ```
   ADMIN_PASSWORD=passwordProduction
   PORT=3001
   ```
5. Catat URL backend yang diberikan (misal `https://app-kelulusan-api.up.railway.app`).

#### B. Deploy Frontend ke Vercel

1. Update `vite.config.ts` — ganti proxy ke URL backend production:

   ```ts
   // Untuk production, proxy tidak digunakan; panggil API langsung via env var.
   // Atau gunakan VITE_API_URL di kode untuk target dinamis.
   ```

   Cara paling sederhana: buat file `.env.production` di root:

   ```env
   VITE_API_BASE=https://app-kelulusan-api.up.railway.app
   ```

   Lalu di semua fetch call di frontend, ganti `'/api/...'` menjadi:

   ```ts
   const API = import.meta.env.VITE_API_BASE ?? ''
   fetch(`${API}/api/lookup`, ...)
   ```

2. Buka [vercel.com](https://vercel.com), import repo dari GitHub.

3. Setting di Vercel:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**: tambahkan `VITE_API_BASE` dengan URL backend

4. Klik **Deploy**.

### Opsi 2 — Full-stack di Vercel (dengan Turso sebagai database)

Jika ingin semua di Vercel:

1. Ganti `better-sqlite3` dengan [`@libsql/client`](https://docs.turso.tech/sdk/ts/quickstart) (Turso).
2. Buat database di [Turso](https://turso.tech), ambil `TURSO_DATABASE_URL` dan `TURSO_AUTH_TOKEN`.
3. Buat file `api/[...route].ts` (Vercel serverless function) yang meng-handle semua request Express.
4. Update `vercel.json`:
   ```json
   {
     "rewrites": [{ "source": "/api/(.*)", "destination": "/api/index" }]
   }
   ```
5. Set semua env vars di Vercel dashboard.

---

## Struktur Project

```
server/
  index.ts      # Express REST API
  database.ts   # SQLite init + schema migration
src/
  App.tsx       # Router setup
  pages/
    StudentPage.tsx   # Halaman publik cek kelulusan
    AdminPage.tsx     # Panel admin
  index.css     # Tailwind + design tokens
data.db          # SQLite (auto-generated, jangan di-commit)
.env             # Secrets (jangan di-commit)
```

Lihat [AGENTS.md](./AGENTS.md) untuk panduan lengkap bagi AI agent dan developer.
