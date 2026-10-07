# ArtaNote — Aplikasi Pencatatan Keuangan Pribadi

Aplikasi sederhana untuk mencatat pemasukan (gaji), pengeluaran wajib, dan
alokasi dana darurat setiap bulan, lalu otomatis menghitung **sisa yang bisa
ditabung** (`remainingToSave`).

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Flowbite React** (komponen UI berbasis Tailwind, responsive)
- **PostgreSQL** + **Prisma ORM**
- **NextAuth v5** (Credentials provider — email & password, multi-user)
- **Docker / Docker Compose** untuk self-hosting, dengan dukungan hybrid ke **Vercel**

## Fitur

- Login multi-user (email + password, di-hash dengan bcrypt). Registrasi
  publik **dinonaktifkan** — akun baru hanya bisa dibuat oleh Admin (lihat
  [Admin & Manajemen User](#admin--manajemen-user)).
- Kategori transaksi: preset bawaan (Gaji, Pengeluaran Wajib, Dana Darurat,
  Tabungan) + kategori custom per user.
- Pencatatan transaksi dengan kategori, jumlah, tanggal, dan catatan.
- Riwayat transaksi yang bisa difilter per bulan/kategori dengan pagination.
- Dashboard ringkasan bulanan: total pemasukan, pengeluaran wajib, dana
  darurat, serta **sisa yang bisa ditabung** = pemasukan − pengeluaran wajib
  − dana darurat.
- Admin: CRUD user (tanpa kemampuan impersonate), dengan password wajib
  diganti saat login pertama baik untuk akun Admin bawaan maupun user yang
  dibuat Admin.
- Desain responsive (mobile, tablet, desktop) menggunakan Flowbite React.

## Menjalankan secara lokal (tanpa Docker)

Prasyarat: Node.js 20+, PostgreSQL yang bisa diakses secara lokal.

```bash
npm install
cp .env.example .env   # isi DATABASE_URL, NEXTAUTH_SECRET, dll.
npx prisma migrate deploy
npm run dev
```

Buka http://localhost:3000.

## Menjalankan dengan Docker Compose (direkomendasikan)

Prasyarat: Docker Desktop / Docker Engine + Docker Compose.

```bash
cp .env.example .env
# Edit .env: ganti NEXTAUTH_SECRET dengan string acak (minimal 32 byte),
# dan sesuaikan kredensial Postgres bila perlu.

docker compose up -d --build
```

Yang terjadi secara otomatis:
1. Container **postgres** dinyalakan dan menunggu hingga sehat (healthcheck).
2. Container **migrate** (one-off) menjalankan `prisma migrate deploy` lalu keluar.
3. Container **app** baru start setelah migrasi berhasil (`service_completed_successfully`).

Aplikasi akan tersedia di http://localhost:3000.

Perintah berguna lainnya:

```bash
docker compose logs -f app       # lihat log aplikasi
docker compose down              # stop semua service (data Postgres tetap ada di volume)
docker compose down -v           # stop + hapus volume data Postgres
```

### Arsitektur Dockerfile

`Dockerfile` memakai multi-stage build:
- `deps` — install dependencies.
- `builder` — `prisma generate` + `next build` (output `standalone`).
- `migrator` — image ringan khusus untuk menjalankan `prisma migrate deploy`
  sebagai service one-off di Compose (punya Prisma CLI lengkap).
- `runner` — image produksi final, hanya berisi Next.js standalone server
  (tanpa Prisma CLI, karena migrasi sudah dijalankan oleh service `migrate`).

## Development dengan Docker (hot-reload)

Selain `docker-compose.yml` (untuk produksi), ada `docker-compose.dev.yml`
khusus untuk development sehari-hari: Postgres + Next.js dev server
berjalan di container, source code di-mount langsung dari folder project
sehingga setiap perubahan file langsung ter-*refresh* di browser — tidak
perlu rebuild image setiap edit kode.

```bash
cp .env.example .env   # kalau belum ada
docker compose -f docker-compose.dev.yml up -d --build
```

Yang terjadi:
1. Container **postgres** (volume terpisah `postgres_dev_data`, port `5432`)
   dinyalakan.
2. Container **app** (dibuat dari `Dockerfile.dev`, hanya install
   dependencies — tidak build) menjalankan `prisma migrate deploy` lalu
   start `next dev`.
3. Folder project di-*bind mount* ke `/app` di container, jadi file yang
   kamu edit di editor langsung tersinkron ke container.

Buka http://localhost:3000 — edit file apa saja (mis. `app/page.tsx`),
simpan, dan perubahan akan muncul otomatis di browser dalam beberapa detik.

**Catatan penting soal hot-reload & CSS di Windows:** Next.js 16 secara
default memakai Turbopack untuk `next dev`, tapi Turbopack tidak bisa
mendeteksi perubahan file yang masuk lewat bind mount Docker Desktop di
Windows. Karena itu, mode dev di Docker (`npm run dev:docker`, dipakai
otomatis oleh `Dockerfile.dev`) memaksa Next.js memakai bundler **webpack**
(`next dev --webpack`) dikombinasikan dengan `WATCHPACK_POLLING=true`, yang
sudah diuji dan terbukti mendeteksi perubahan file secara konsisten.

Project ini memakai Tailwind CSS v4, dan loader Tailwind untuk Turbopack
(`@tailwindcss/turbopack`, dikonfigurasi di `next.config.ts`) **tidak
berjalan saat memakai webpack** — tanpa konfigurasi tambahan, halaman akan
tampil tanpa styling sama sekali di mode dev Docker. Supaya CSS tetap
ter-generate saat webpack dipakai, ditambahkan `postcss.config.mjs` yang
memanggil `@tailwindcss/postcss` (varian Tailwind v4 untuk PostCSS/webpack).
Build produksi (`next build`, dipakai `docker-compose.yml`) tetap memakai
Turbopack + loader aslinya dan tidak terpengaruh oleh `postcss.config.mjs`
ini.

Perintah berguna lainnya:

```bash
docker compose -f docker-compose.dev.yml logs -f app   # lihat log dev server
docker compose -f docker-compose.dev.yml exec app npx prisma studio   # Prisma Studio di dalam container
docker compose -f docker-compose.dev.yml down           # stop (data Postgres tetap ada)
docker compose -f docker-compose.dev.yml down -v        # stop + hapus volume data dev
```

> Alternatif tercepat kalau tidak butuh dev Postgres & app sama-sama di
> Docker: jalankan `docker compose -f docker-compose.dev.yml up -d postgres`
> saja (hanya Postgres di Docker), lalu `npm run dev` biasa di host —
> Turbopack native di host jauh lebih cepat tanpa masalah file-watching.

## Deploy ke Vercel (hybrid)

Aplikasi ini juga bisa dideploy langsung ke Vercel tanpa Docker, menggunakan
Vercel Postgres (atau provider Postgres lain seperti Neon/Supabase).

1. Push repo ke GitHub, lalu import project di [vercel.com](https://vercel.com).
2. Tambahkan database Postgres (mis. **Vercel Postgres** / **Neon**) dan
   salin connection string yang diberikan ke environment variable
   `DATABASE_URL` di pengaturan Vercel project.
   - Jika provider memberi connection string dengan PgBouncer/connection
     pooling, pastikan menambahkan parameter `?pgbouncer=true` atau gunakan
     connection string "pooled" yang direkomendasikan provider agar cocok
     dengan Prisma di lingkungan serverless.
3. Set environment variables berikut di Vercel (Project Settings → Environment Variables):
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET` (generate dengan `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (mis. `https://nama-app-anda.vercel.app`)
4. Migrasi database (termasuk migration seed Admin) dijalankan otomatis saat
   build di Vercel — `vercel.json` di root project sudah mengatur
   `buildCommand: "prisma migrate deploy && next build"`, jadi tidak perlu
   langkah manual tambahan.
5. Deploy. Vercel akan mengabaikan `output: "standalone"` di
   `next.config.ts` (konfigurasi ini hanya dipakai untuk build Docker) dan
   tetap memakai sistem build serverless miliknya sendiri — tidak ada
   konflik.

## Admin & Manajemen User

Registrasi publik (`/register`) sudah dinonaktifkan. Semua akun dibuat lewat
halaman **Admin → Kelola User** (`/admin/users`, hanya bisa diakses role
`ADMIN`).

**Akun Admin bawaan** (otomatis ter-seed oleh migration
`20261007163000_add_admin_role_and_force_password_change`, di semua
environment — dev Docker, produksi Docker, maupun Vercel):

| Email | Password default |
|---|---|
| `admin@artanote.app` | `ChangeMe123!` |

> ⚠️ **Ganti password ini sesegera mungkin setelah deploy pertama.** Password
> default ada di source code (migration SQL) sehingga dianggap publik.
> Sistem akan otomatis memaksa ganti password saat login pertama kali
> (halaman `/change-password`) — ini berlaku untuk semua akun yang baru
> dibuat, bukan hanya Admin bawaan.

Aturan Admin:
- Admin bisa membuat, melihat, mengedit (nama/email/role/reset password),
  dan menghapus user lain — **tidak bisa** login/masuk sebagai user lain
  (tidak ada fitur impersonate).
- Setiap user yang dibuat Admin otomatis diberi password sementara dan wajib
  menggantinya saat login pertama (`mustChangePassword = true`).
- Admin tidak bisa mengubah role akun miliknya sendiri atau menghapus akun
  miliknya sendiri (mencegah lockout karena tidak ada mekanisme superadmin
  pemulihan).

## Environment Variables

Lihat `.env.example` untuk daftar lengkap:

| Variable | Keterangan |
|---|---|
| `DATABASE_URL` | Connection string PostgreSQL (`postgresql://user:pass@host:5432/db?schema=public`) |
| `NEXTAUTH_SECRET` | Secret untuk menandatangani session JWT NextAuth. Wajib diganti nilai acak minimal 32 byte di produksi. |
| `NEXTAUTH_URL` | Base URL aplikasi (mis. `http://localhost:3000` saat lokal/Docker, atau domain Vercel saat produksi) |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Kredensial yang dipakai container Postgres di `docker-compose.yml` |

## Struktur Database

- `User` — akun pengguna (email, password hash, `role` [`ADMIN`/`USER`],
  `mustChangePassword`).
- `Category` — kategori transaksi (tipe: `INCOME`, `MANDATORY_EXPENSE`,
  `EMERGENCY_FUND`, `SAVINGS`), bisa preset atau custom per user.
- `Transaction` — transaksi yang menyimpan jumlah, tanggal, catatan, dan
  kategori terkait.

## Scripts

| Script | Keterangan |
|---|---|
| `npm run dev` | Jalankan dev server (Turbopack, dipakai saat lokal tanpa Docker) |
| `npm run dev:docker` | Jalankan dev server (webpack + polling, dipakai `Dockerfile.dev` agar hot-reload jalan di bind mount Docker) |
| `npm run build` | Build production |
| `npm run start` | Jalankan production server (setelah build) |
| `npm run lint` | Jalankan ESLint |
| `npm run db:migrate` | `prisma migrate deploy` (produksi) |
| `npm run db:migrate:dev` | `prisma migrate dev` (bikin migrasi baru saat development) |
| `npm run db:seed` | Jalankan seed script |
| `npm run db:studio` | Buka Prisma Studio |
