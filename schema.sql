-- ==============================================================================
-- SKEMA LENGKAP SUPABASE DATABASE & STORAGE
-- Website Portofolio Pribadi & CMS Terproteksi
-- Sesuai PRD Section 8 & Section 9
-- ==============================================================================

-- Aktifkan pgcrypto untuk gen_random_uuid() jika belum aktif
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. TABEL-TABEL UTAMA
-- ==============================================================================

-- 1.1 Tabel Profil
CREATE TABLE IF NOT EXISTS public.profile (
  id TEXT PRIMARY KEY DEFAULT 'main-profile',
  nama TEXT NOT NULL,
  nama_aksen TEXT,
  nama_sisa TEXT,
  tagline TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  status TEXT DEFAULT 'Terbuka untuk Kolaborasi',
  avatar_url TEXT,
  resume_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.2 Tabel Skills / Keahlian (Tanpa level bar sesuai PRD)
CREATE TABLE IF NOT EXISTS public.skills (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  nama TEXT NOT NULL,
  urutan INT DEFAULT 0
);

-- 1.3 Tabel Projects / Portofolio Karya
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  judul TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  gambar_url TEXT NOT NULL,
  link TEXT NOT NULL,
  urutan INT DEFAULT 0
);

-- 1.4 Tabel Experiences / Pengalaman Kerja & Organisasi
CREATE TABLE IF NOT EXISTS public.experiences (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  instansi TEXT NOT NULL,
  peran TEXT,
  tahun TEXT NOT NULL,
  lokasi TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  urutan INT DEFAULT 0
);

-- 1.5 Tabel Courses / Pelatihan & Sertifikasi
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  nama_course TEXT NOT NULL,
  penyelenggara TEXT NOT NULL,
  tahun TEXT NOT NULL,
  lokasi TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  urutan INT DEFAULT 0
);

-- 1.6 Tabel Languages / Bahasa (Format teks "Bahasa — Level")
CREATE TABLE IF NOT EXISTS public.languages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  nama_bahasa TEXT NOT NULL,
  level TEXT NOT NULL
);

-- 1.7 Tabel Contacts / Informasi Kontak
CREATE TABLE IF NOT EXISTS public.contacts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  tipe TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  link TEXT NOT NULL
);

-- ==============================================================================
-- 2. ROW LEVEL SECURITY (RLS) & KEBIJAKAN AKSES
-- ==============================================================================

-- Aktifkan RLS pada seluruh tabel publik
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama jika ada untuk mencegah duplikasi nama policy
DROP POLICY IF EXISTS "Public read profile" ON public.profile;
DROP POLICY IF EXISTS "Public read skills" ON public.skills;
DROP POLICY IF EXISTS "Public read projects" ON public.projects;
DROP POLICY IF EXISTS "Public read experiences" ON public.experiences;
DROP POLICY IF EXISTS "Public read courses" ON public.courses;
DROP POLICY IF EXISTS "Public read languages" ON public.languages;
DROP POLICY IF EXISTS "Public read contacts" ON public.contacts;

DROP POLICY IF EXISTS "Admin write profile" ON public.profile;
DROP POLICY IF EXISTS "Admin write skills" ON public.skills;
DROP POLICY IF EXISTS "Admin write projects" ON public.projects;
DROP POLICY IF EXISTS "Admin write experiences" ON public.experiences;
DROP POLICY IF EXISTS "Admin write courses" ON public.courses;
DROP POLICY IF EXISTS "Admin write languages" ON public.languages;
DROP POLICY IF EXISTS "Admin write contacts" ON public.contacts;

-- Kebijakan Akses Baca Publik (Anonim & Authenticated dapat membaca isi portofolio)
CREATE POLICY "Public read profile" ON public.profile FOR SELECT USING (true);
CREATE POLICY "Public read skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Public read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public read experiences" ON public.experiences FOR SELECT USING (true);
CREATE POLICY "Public read courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Public read languages" ON public.languages FOR SELECT USING (true);
CREATE POLICY "Public read contacts" ON public.contacts FOR SELECT USING (true);

-- Kebijakan Akses Tulis Admin (Hanya pengguna terotentikasi yang dapat menambah, mengubah, atau menghapus)
CREATE POLICY "Admin write profile" ON public.profile FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin write skills" ON public.skills FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin write projects" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin write experiences" ON public.experiences FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin write courses" ON public.courses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin write languages" ON public.languages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin write contacts" ON public.contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- 3. KONFIGURASI SUPABASE STORAGE (BUCKET 'avatars' & 'projects')
-- ==============================================================================

-- Buat storage bucket publik untuk foto avatar dan preview project jika belum ada
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('projects', 'projects', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Hapus storage policy lama jika ada
DROP POLICY IF EXISTS "Public Access Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Avatars" ON storage.objects;

DROP POLICY IF EXISTS "Public Access Projects" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Projects" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Projects" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Projects" ON storage.objects;

-- Storage Policy: Akses Baca Publik
CREATE POLICY "Public Access Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Public Access Projects" ON storage.objects FOR SELECT USING (bucket_id = 'projects');

-- Storage Policy: Upload untuk User Terautentikasi (Admin)
CREATE POLICY "Authenticated Upload Avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Authenticated Upload Projects" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'projects');

-- Storage Policy: Update & Delete untuk User Terautentikasi (Admin)
CREATE POLICY "Authenticated Update Avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated Update Projects" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'projects');

CREATE POLICY "Authenticated Delete Avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated Delete Projects" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'projects');

-- ==============================================================================
-- 4. DATA AWAL (SEED DATA)
-- Mengisi database dengan data portofolio awal profesional
-- ==============================================================================

-- 4.1 Data Profil Awal
INSERT INTO public.profile (id, nama, nama_aksen, nama_sisa, tagline, deskripsi, status, avatar_url, resume_url)
VALUES (
  'main-profile',
  'Rania Pratama',
  'Rania',
  'Pratama',
  'Brand Designer & Visual Communication Strategist',
  'Praktisi desain komunikasi visual dan branding dengan pengalaman lebih dari 5 tahun dalam merancang identitas merek, kampanye kreatif, serta strategi konten visual untuk organisasi, korporat, dan UMKM berkembang.',
  'Terbuka untuk Kolaborasi',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80',
  'https://drive.google.com/file/d/1ExampleResumePortfolio/view?usp=sharing'
)
ON CONFLICT (id) DO NOTHING;

-- 4.2 Data Skills Awal
INSERT INTO public.skills (id, nama, urutan) VALUES
  ('sk-1', 'Canva', 1),
  ('sk-2', 'Adobe Illustrator', 2),
  ('sk-3', 'Adobe Photoshop', 3),
  ('sk-4', 'Brand Identity Strategy', 4),
  ('sk-5', 'Microsoft Office & Word', 5),
  ('sk-6', 'Visual Storytelling', 6),
  ('sk-7', 'Copywriting Kampanye', 7),
  ('sk-8', 'Social Media Management', 8),
  ('sk-9', 'Public Speaking & Presentasi', 9),
  ('sk-10', 'Art Direction', 10)
ON CONFLICT (id) DO NOTHING;

-- 4.3 Data Projects Awal
INSERT INTO public.projects (id, judul, deskripsi, gambar_url, link, urutan) VALUES
  (
    'proj-1',
    'Rebranding Identitas Nusantara Coffee & Roastery',
    'Pengembangan identitas visual menyeluruh, mulai dari logo modern, kemasan ramah lingkungan, pedoman tipografi, hingga materi promosi outlet untuk jaringan kedai kopi lokal.',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    'https://drive.google.com/drive/folders/sample-branding-nusantara',
    1
  ),
  (
    'proj-2',
    'Kampanye Edukasi Nutrisi Keluarga Sehat',
    'Pembuatan infografis visual, video presentasi animasi singkat di Google Drive, dan buklet panduan praktis untuk program CSR nutrisi anak usia dini.',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
    'https://drive.google.com/file/d/sample-edukasi-video-animasi/view',
    2
  ),
  (
    'proj-3',
    'Laporan Keberlanjutan & Annual Report Visual PT Kreasi Mandiri',
    'Tata letak editorial laporan tahunan setebal 72 halaman dengan infografis data terstruktur, tipografi harmonis, dan format siap cetak serta digital interaktif.',
    'https://images.unsplash.com/photo-1455849318743-b2233052fcff?auto=format&fit=crop&w=800&q=80',
    'https://drive.google.com/file/d/sample-annual-report-pdf/view',
    3
  ),
  (
    'proj-4',
    'Desain Merchandise & Brand Kit Festival Seni Budaya 2025',
    'Perancangan aset visual festival musik dan seni budaya tradisional termasuk kaos, totebag, poster promosi kota, dan tiket masuk eksklusif.',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
    'https://drive.google.com/drive/folders/sample-festival-merchandise',
    4
  )
ON CONFLICT (id) DO NOTHING;

-- 4.4 Data Experiences Awal
INSERT INTO public.experiences (id, instansi, peran, tahun, lokasi, deskripsi, urutan) VALUES
  (
    'exp-1',
    'Studio Cerita Kreatif',
    'Senior Brand & Visual Designer',
    '2023 — Sekarang',
    'Jakarta Selatan, Indonesia',
    'Memimpin perancangan identitas visual untuk 25+ klien korporat dan institusi, mengarahkan tim desainer junior, dan menyelaraskan komunikasi merek di berbagai kanal.',
    1
  ),
  (
    'exp-2',
    'Yayasan Lentera Pendidikan',
    'Koordinator Komunikasi & Publikasi',
    '2021 — 2023',
    'Bandung, Indonesia',
    'Mengelola produksi materi visual publikasi tahunan, media sosial, serta kurikulum visual untuk program pelatihan guru di pelosok daerah.',
    2
  ),
  (
    'exp-3',
    'Agensi Media Warna Citra',
    'Graphic Designer & Content Specialist',
    '2019 — 2021',
    'Surabaya, Indonesia',
    'Merancang aset visual kampanye digital, layout majalah korporat, serta materi presentasi promosi untuk beragam klien industri ritel dan hospitality.',
    3
  )
ON CONFLICT (id) DO NOTHING;

-- 4.5 Data Courses Awal
INSERT INTO public.courses (id, nama_course, penyelenggara, tahun, lokasi, deskripsi, urutan) VALUES
  (
    'crs-1',
    'Executive Masterclass: Strategic Brand Architecture',
    'Design Leadership Academy & Brand Institute',
    '2024',
    'Daring (Online)',
    'Pendalaman metodologi riset positioning merek, audit visual pasar, dan pengembangan guideline identitas skala enterprise.',
    1
  ),
  (
    'crs-2',
    'Sertifikasi Tata Kelola Desain Publikasi & Editorial',
    'Pusat Pelatihan Komunikasi Kreatif Nasional',
    '2022',
    'Jakarta, Indonesia',
    'Pelatihan intensif layout cetak profesional, manajemen warna prepress, dan standar aksesibilitas dokumen publik.',
    2
  ),
  (
    'crs-3',
    'Visual Storytelling for Community Impact',
    'Southeast Asia Creative Hub',
    '2020',
    'Yogyakarta, Indonesia',
    'Workshop penceritaan visual berbasis advokasi masyarakat dan desain materi komunikasi berbasis empati.',
    3
  )
ON CONFLICT (id) DO NOTHING;

-- 4.6 Data Languages Awal
INSERT INTO public.languages (id, nama_bahasa, level) VALUES
  ('lang-1', 'Bahasa Indonesia', 'Native'),
  ('lang-2', 'Bahasa Inggris', 'Intermediate')
ON CONFLICT (id) DO NOTHING;

-- 4.7 Data Contacts Awal
INSERT INTO public.contacts (id, tipe, label, value, link) VALUES
  (
    'cnt-1',
    'whatsapp',
    'WhatsApp',
    '+62 812-3456-7890',
    'https://wa.me/6281234567890?text=Halo%20Rania,%20saya%20tertarik%20untuk%20berkolaborasi.'
  ),
  (
    'cnt-2',
    'email',
    'Email',
    'rania.pratama.design@gmail.com',
    'mailto:rania.pratama.design@gmail.com?subject=Inquiry%20Kolaborasi%20Portofolio'
  ),
  (
    'cnt-3',
    'instagram',
    'Instagram',
    '@rania.visuals',
    'https://instagram.com/rania.visuals'
  ),
  (
    'cnt-4',
    'linkedin',
    'LinkedIn',
    'linkedin.com/in/raniapratama',
    'https://linkedin.com/in/raniapratama'
  )
ON CONFLICT (id) DO NOTHING;
