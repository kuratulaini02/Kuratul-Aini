# Panduan Setup Supabase & Konfigurasi .env

Dokumen ini berisi panduan langkah demi langkah untuk menghubungkan website portofolio ke **Supabase Database, Authentication, dan Storage**.

---

## 1. Menyiapkan Project Supabase

1. Buka [https://supabase.com](https://supabase.com) dan login atau buat akun baru.
2. Klik **"New Project"**.
3. Beri nama project (misalnya: `portofolio-rania`) dan buat database password yang aman.
4. Pilih region terdekat (misalnya: `Singapore (ap-southeast-1)`).
5. Tunggu proses provisi database selesai (~1-2 menit).

---

## 2. Menjalankan Skema SQL (Database & Storage)

Skema database lengkap telah disiapkan di file **`/schema.sql`** atau **`/supabase/schema.sql`**.

### Langkah Eksekusi:
1. Di dashboard Supabase, buka menu **SQL Editor** di sidebar kiri (ikon `>_`).
2. Klik **"New query"**.
3. Buka file `schema.sql` pada repository ini, salin seluruh isinya (atau klik tombol **"Salin SQL"** di menu **Admin Dashboard > Sistem & Supabase**).
4. Tempel (paste) kode SQL ke dalam query editor di Supabase.
5. Klik tombol **"Run"** (atau tekan `Ctrl + Enter` / `Cmd + Enter`).
6. Supabase akan otomatis membuat:
   - Tabel: `profile`, `skills`, `projects`, `experiences`, `courses`, `languages`, `contacts`
   - Row Level Security (RLS) policies (Akses baca publik, akses tulis untuk admin)
   - Storage Buckets: `avatars` (publik) dan `projects` (publik) beserta kebijakan upload/view
   - Data awal (Seed Data) profil profesional

---

## 3. Menyiapkan Akun Admin

Untuk dapat login ke `/admin/login` menggunakan Supabase Auth:
1. Di dashboard Supabase, buka menu **Authentication** -> **Users**.
2. Klik **"Add User"** -> **"Create User"**.
3. Masukkan:
   - **User Email**: email Anda (misalnya: `admin@portofolio.com` atau email pribadi Anda)
   - **Password**: password yang kuat
   - Centang **"Auto Confirm User?"** agar tidak perlu verifikasi email.
4. Klik **"Create User"**.

---

## 4. Mengisi File `.env`

File `.env` sudah dibuat di root project. Anda hanya perlu mengisi nilainya:

1. Di dashboard Supabase, buka **Project Settings** (ikon gear di pojok kiri bawah) -> **API**.
2. Salin nilai berikut:
   - **Project URL**
   - **Project API Keys (`anon` / `public`)**
   - **Project API Keys (`service_role` / `secret`)** *(opsional, untuk keep-alive cron)*
3. Buka file `.env` di proyek ini dan ganti nilai placeholder:

```env
# Supabase URL & Anon Key (diperlukan untuk frontend & CMS)
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...kunci_anon_anda...

# Kompatibilitas server / Next.js
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...kunci_anon_anda...

# Service Role Key (opsional untuk keep-alive background ping)
SUPABASE_SERVICE_ROLE_KEY=eyJh...kunci_service_role_anda...

# Token verifikasi Vercel Cron Keep-Alive
CRON_SECRET=portfolio_keepalive_secret_2026
```

> **Tips Fleksibilitas**: Selain lewat file `.env`, URL dan Anon Key juga dapat langsung dikonfigurasi melalui form modal di halaman `/admin/login` jika Anda ingin mengujinya langsung di preview tanpa restart server.

---

## 5. Fitur Keep-Alive Anti-Pause Supabase

Sesuai spesifikasi PRD Section 9:
- Endpoint: `GET /api/cron/keepalive`
- Otomatis melakukan ping ringan `select id from projects limit 1` setiap hari pukul 08:00 WIB (01:00 UTC) melalui `vercel.json`.
- Mencegah database Supabase Free Tier tertidur (auto-pause) setelah 7 hari tidak aktif.
