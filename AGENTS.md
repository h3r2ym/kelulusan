# App Kelulusan — Agent Instructions

Aplikasi web untuk mengecek status kelulusan siswa. Pengguna memasukkan **NIM** dan **tanggal lahir**, lalu sistem menampilkan apakah siswa tersebut lulus atau tidak, berdasarkan data sekolah yang terdaftar.

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |

## Commands

```bash
npm run dev       # dev server (HMR)
npm run build     # tsc -b && vite build
npm run lint      # eslint
npm run preview   # preview production build
```

## Project Architecture

```
src/
  App.tsx         # root component (entry point UI)
  index.css       # global CSS + Tailwind import + CSS custom properties
  main.tsx        # React DOM render entry
  assets/         # static images/icons
```

Belum ada folder `components/`, `pages/`, `hooks/`, atau `lib/`. Buat saat diperlukan di bawah `src/`.

### Data Model (rencana)

```ts
// Sekolah yang terdaftar di sistem
interface School {
  id: string
  name: string
  year: number          // tahun kelulusan
}

// Data siswa per sekolah
interface Student {
  nim: string
  birthDate: string     // format ISO: "YYYY-MM-DD"
  schoolId: string
  isGraduated: boolean
}

// Hasil pengecekan
interface LulusanResult {
  student: Student
  school: School
  isGraduated: boolean
}
```

## Styling Conventions

- Tailwind CSS v4: **tidak ada `tailwind.config.js`**, konfigurasi via CSS.
- Import di `index.css`: `@import "tailwindcss";`
- CSS custom properties (design tokens) didefinisikan di `src/index.css`:
  - `--accent: #aa3bff` — warna utama
  - `--text`, `--text-h`, `--bg`, `--border` — warna teks & layout
  - `--sans`, `--heading`, `--mono` — font stack
- Gunakan utility class Tailwind untuk layout/spacing; gunakan `var(--token)` untuk warna brand.

## Potential Pitfalls

- **`vite.config.ts` saat ini tidak menyertakan plugin React** (`@vitejs/plugin-react`). Tambahkan jika belum ada saat men-setup project baru atau mengalami error HMR/JSX:
  ```ts
  import react from '@vitejs/plugin-react'
  // plugins: [react(), tailwindcss()]
  ```
- Tailwind v4 tidak lagi menggunakan `@tailwind base/components/utilities` — gunakan `@import "tailwindcss"` saja.
- Data siswa/sekolah kemungkinan di-hardcode atau di-fetch dari JSON/API lokal. Jaga validasi NIM dan tanggal lahir di sisi client sebelum lookup.

## Core UI Flow

1. **Pilih sekolah** (dropdown atau URL param `?school=id`)
2. **Form input**: NIM + tanggal lahir
3. **Lookup**: cari siswa berdasarkan NIM + tanggal lahir yang cocok
4. **Hasil**: tampilkan status LULUS / TIDAK LULUS dengan nama siswa dan sekolah
