import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { AppData, Profile, Skill, Project, Experience, Course, Language, ContactItem } from '../types';
import { initialData } from './defaultData';

const STORAGE_KEY = 'portfolio_cms_data_v1';
const SUPABASE_CONFIG_KEY = 'portfolio_supabase_custom_config';
const DEMO_SESSION_KEY = 'portfolio_demo_admin_session';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Check environment variables first, then user-stored configuration
export function getSupabaseConfig(): SupabaseConfig | null {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL;
  const envAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (envUrl && envAnonKey && !envUrl.includes('your-project')) {
    return { url: envUrl, anonKey: envAnonKey };
  }

  try {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading saved supabase config', e);
  }

  return null;
}

export function saveSupabaseConfig(config: SupabaseConfig | null) {
  if (!config) {
    localStorage.removeItem(SUPABASE_CONFIG_KEY);
  } else {
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config) return null;
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey);
    } catch (e) {
      console.warn('Could not initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
}

// Local storage fallback for seamless preview & offline mode
export function getLocalData(): AppData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure all arrays exist
      return {
        profile: { ...initialData.profile, ...(parsed.profile || {}) },
        skills: Array.isArray(parsed.skills) ? parsed.skills : initialData.skills,
        projects: Array.isArray(parsed.projects) ? parsed.projects : initialData.projects,
        experiences: Array.isArray(parsed.experiences) ? parsed.experiences : initialData.experiences,
        courses: Array.isArray(parsed.courses) ? parsed.courses : initialData.courses,
        languages: Array.isArray(parsed.languages) ? parsed.languages : initialData.languages,
        contacts: Array.isArray(parsed.contacts) ? parsed.contacts : initialData.contacts,
      };
    }
  } catch (err) {
    console.error('Error reading local portfolio data', err);
  }
  return initialData;
}

export function saveLocalData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving local portfolio data', err);
  }
}

// Reset data to defaults
export function resetToDefaultData(): AppData {
  saveLocalData(initialData);
  return initialData;
}

// Load data (attempts Supabase first if configured, falls back to local data)
export async function loadAppData(): Promise<{ data: AppData; source: 'supabase' | 'local' }> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: getLocalData(), source: 'local' };
  }

  try {
    const [
      profileRes,
      skillsRes,
      projectsRes,
      expRes,
      coursesRes,
      langRes,
      contactsRes
    ] = await Promise.all([
      client.from('profile').select('*').limit(1).maybeSingle(),
      client.from('skills').select('*').order('urutan', { ascending: true }),
      client.from('projects').select('*').order('urutan', { ascending: true }),
      client.from('experiences').select('*').order('urutan', { ascending: true }),
      client.from('courses').select('*').order('urutan', { ascending: true }),
      client.from('languages').select('*'),
      client.from('contacts').select('*')
    ]);

    const local = getLocalData();

    // If supabase has data, use it; otherwise fallback cleanly
    const mergedProfile: Profile = profileRes.data ? {
      id: profileRes.data.id,
      nama: profileRes.data.nama || local.profile.nama,
      nama_aksen: profileRes.data.nama_aksen || local.profile.nama_aksen,
      nama_sisa: profileRes.data.nama_sisa || local.profile.nama_sisa,
      tagline: profileRes.data.tagline || local.profile.tagline,
      deskripsi: profileRes.data.deskripsi || local.profile.deskripsi,
      status: profileRes.data.status || local.profile.status,
      avatar_url: profileRes.data.avatar_url || local.profile.avatar_url,
      resume_url: profileRes.data.resume_url ?? local.profile.resume_url,
      updated_at: profileRes.data.updated_at || new Date().toISOString(),
    } : local.profile;

    const data: AppData = {
      profile: mergedProfile,
      skills: (skillsRes.data && skillsRes.data.length > 0) ? skillsRes.data : local.skills,
      projects: (projectsRes.data && projectsRes.data.length > 0) ? projectsRes.data : local.projects,
      experiences: (expRes.data && expRes.data.length > 0) ? expRes.data : local.experiences,
      courses: (coursesRes.data && coursesRes.data.length > 0) ? coursesRes.data : local.courses,
      languages: (langRes.data && langRes.data.length > 0) ? langRes.data : local.languages,
      contacts: (contactsRes.data && contactsRes.data.length > 0) ? contactsRes.data : local.contacts,
    };

    saveLocalData(data);
    return { data, source: 'supabase' };
  } catch (error) {
    console.warn('Supabase fetch failed, utilizing cached local data:', error);
    return { data: getLocalData(), source: 'local' };
  }
}

// Image upload helper supporting Supabase Storage bucket 'avatars' or 'projects', with base64 fallback
export async function uploadImageToStorage(
  bucket: 'avatars' | 'projects',
  file: File
): Promise<string> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const { data, error } = await client.storage
        .from(bucket)
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (!error && data) {
        const { data: publicUrlData } = client.storage.from(bucket).getPublicUrl(fileName);
        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
      console.warn('Supabase storage upload error, falling back to data URL:', error);
    } catch (err) {
      console.warn('Supabase storage exception, falling back to data URL:', err);
    }
  }

  // Fallback to base64 DataURL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Authentication Helpers
export async function getAdminSession(): Promise<{ user: User | { email: string; isDemo?: boolean } | null; isDemo: boolean }> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data: { session } } = await client.auth.getSession();
      if (session?.user) {
        return { user: session.user, isDemo: false };
      }
    } catch (e) {
      console.warn('Supabase auth session check failed:', e);
    }
  }

  const demoSession = localStorage.getItem(DEMO_SESSION_KEY);
  if (demoSession) {
    try {
      const parsed = JSON.parse(demoSession);
      return { user: parsed, isDemo: true };
    } catch (e) {
      localStorage.removeItem(DEMO_SESSION_KEY);
    }
  }

  return { user: null, isDemo: false };
}

export function setDemoAdminSession(email: string = 'admin@portofolio.local'): void {
  localStorage.setItem(
    DEMO_SESSION_KEY,
    JSON.stringify({
      email,
      id: 'demo-admin-id',
      isDemo: true,
      logged_at: new Date().toISOString()
    })
  );
}

export async function adminLogout(): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut failed:', e);
    }
  }
  localStorage.removeItem(DEMO_SESSION_KEY);
}

// Helper to provide SQL migration script for user's Supabase dashboard
export const SUPABASE_SQL_SCHEMA = `-- ==========================================
-- PRD Section 8 & 9: Skema Database & Storage Supabase
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabel profile
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

-- 2. Tabel skills
CREATE TABLE IF NOT EXISTS public.skills (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  nama TEXT NOT NULL,
  urutan INT DEFAULT 0
);

-- 3. Tabel projects
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  judul TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  gambar_url TEXT NOT NULL,
  link TEXT NOT NULL,
  urutan INT DEFAULT 0
);

-- 4. Tabel experiences
CREATE TABLE IF NOT EXISTS public.experiences (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  instansi TEXT NOT NULL,
  peran TEXT,
  tahun TEXT NOT NULL,
  lokasi TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  urutan INT DEFAULT 0
);

-- 5. Tabel courses
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  nama_course TEXT NOT NULL,
  penyelenggara TEXT NOT NULL,
  tahun TEXT NOT NULL,
  lokasi TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  urutan INT DEFAULT 0
);

-- 6. Tabel languages
CREATE TABLE IF NOT EXISTS public.languages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  nama_bahasa TEXT NOT NULL,
  level TEXT NOT NULL
);

-- 7. Tabel contacts
CREATE TABLE IF NOT EXISTS public.contacts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  tipe TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  link TEXT NOT NULL
);

-- 8. Row Level Security (RLS)
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Read publik untuk semua
CREATE POLICY "Public read profile" ON public.profile FOR SELECT USING (true);
CREATE POLICY "Public read skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Public read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public read experiences" ON public.experiences FOR SELECT USING (true);
CREATE POLICY "Public read courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Public read languages" ON public.languages FOR SELECT USING (true);
CREATE POLICY "Public read contacts" ON public.contacts FOR SELECT USING (true);

-- Write hanya untuk user terautentikasi (admin)
CREATE POLICY "Admin write profile" ON public.profile FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin write skills" ON public.skills FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin write projects" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin write experiences" ON public.experiences FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin write courses" ON public.courses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin write languages" ON public.languages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin write contacts" ON public.contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. Storage Buckets ('avatars' & 'projects')
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true), ('projects', 'projects', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public Access Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Public Access Projects" ON storage.objects FOR SELECT USING (bucket_id = 'projects');

CREATE POLICY "Authenticated Upload Avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Authenticated Upload Projects" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'projects');

CREATE POLICY "Authenticated Update Avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated Update Projects" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'projects');

CREATE POLICY "Authenticated Delete Avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated Delete Projects" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'projects');
`;
