export interface Profile {
  id: string;
  nama: string;
  nama_aksen?: string; // portion of name highlighted in blue (e.g. "Rania")
  nama_sisa?: string;  // rest of the name (e.g. "Pratama")
  tagline: string;
  deskripsi: string;
  status: string;
  avatar_url: string;
  resume_url?: string | null; // Conditional rendering in Hero
  updated_at: string;
}

export interface Skill {
  id: string;
  nama: string;
  urutan?: number;
}

export interface Project {
  id: string;
  judul: string;
  deskripsi: string;
  gambar_url: string;
  link: string; // URL eksternal or Google Drive (video/music/animation/etc.)
  urutan: number;
}

export interface Experience {
  id: string;
  instansi: string;
  peran?: string;
  tahun: string;
  lokasi: string;
  deskripsi: string;
  urutan: number;
}

export interface Course {
  id: string;
  nama_course: string;
  penyelenggara: string;
  tahun: string;
  lokasi: string;
  deskripsi: string;
  urutan: number;
}

export interface Language {
  id: string;
  nama_bahasa: string;
  level: string; // e.g. "Native", "Intermediate"
}

export interface ContactItem {
  id: string;
  tipe: 'whatsapp' | 'email' | 'instagram' | 'linkedin';
  label: string;
  value: string;
  link: string;
}

export interface AppData {
  profile: Profile;
  skills: Skill[];
  projects: Project[];
  experiences: Experience[];
  courses: Course[];
  languages: Language[];
  contacts: ContactItem[];
}
