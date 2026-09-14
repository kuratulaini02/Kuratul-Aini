import React, { useState } from 'react';
import {
  User as UserIcon,
  FolderKanban,
  Sparkles,
  Briefcase,
  Award,
  Languages,
  Mail,
  LogOut,
  Save,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Eye,
  CheckCircle2,
  Database,
  ArrowUpDown,
  FileText,
  Activity,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { AppData, Profile, Skill, Project, Experience, Course, Language, ContactItem } from '../../types';
import { ImageUploader } from './ImageUploader';
import { adminLogout, saveLocalData, resetToDefaultData, SUPABASE_SQL_SCHEMA, getSupabaseClient } from '../../lib/supabase';

interface AdminDashboardProps {
  appData: AppData;
  onDataChange: (newData: AppData) => void;
  onLogout: () => void;
  onViewPublic: () => void;
}

type TabType = 'profile' | 'projects' | 'skills' | 'experiences' | 'courses' | 'languages' | 'contacts' | 'system';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  appData,
  onDataChange,
  onLogout,
  onViewPublic,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [saveAlert, setSaveAlert] = useState<string | null>(null);

  // Form states for adding/editing items
  const [profileForm, setProfileForm] = useState<Profile>({ ...appData.profile });

  // Projects form modal
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projectForm, setProjectForm] = useState<Partial<Project>>({
    judul: '',
    deskripsi: '',
    gambar_url: '',
    link: '',
    urutan: appData.projects.length + 1,
  });

  // Skills form
  const [newSkillName, setNewSkillName] = useState('');
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  // Experience form modal
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [isAddingExp, setIsAddingExp] = useState(false);
  const [expForm, setExpForm] = useState<Partial<Experience>>({
    instansi: '',
    peran: '',
    tahun: '',
    lokasi: '',
    deskripsi: '',
    urutan: appData.experiences.length + 1,
  });

  // Course form modal
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [courseForm, setCourseForm] = useState<Partial<Course>>({
    nama_course: '',
    penyelenggara: '',
    tahun: '',
    lokasi: '',
    deskripsi: '',
    urutan: appData.courses.length + 1,
  });

  // Language form modal
  const [editingLang, setEditingLang] = useState<Language | null>(null);
  const [newLangName, setNewLangName] = useState('');
  const [newLangLevel, setNewLangLevel] = useState('Native');

  // Contact form
  const [contactForms, setContactForms] = useState<ContactItem[]>([...appData.contacts]);

  // System keep-alive test
  const [keepaliveResult, setKeepaliveResult] = useState<any>(null);
  const [isTestingKeepalive, setIsTestingKeepalive] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const showNotification = (msg: string) => {
    setSaveAlert(msg);
    setTimeout(() => setSaveAlert(null), 3500);
  };

  // Sync to database / local storage
  const commitData = (updated: AppData, message = 'Perubahan berhasil disimpan!') => {
    onDataChange(updated);
    saveLocalData(updated);

    // If Supabase client exists, attempt table sync in background
    const client = getSupabaseClient();
    if (client) {
      // Async update to supabase table
      client.from('profile').upsert(updated.profile).then(() => {});
    }

    showNotification(message);
  };

  // 1. Save Profile Handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...appData,
      profile: {
        ...profileForm,
        updated_at: new Date().toISOString(),
      },
    };
    commitData(updated, 'Profil berhasil diperbarui!');
  };

  // 2. Project Handlers
  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.judul || !projectForm.link) {
      alert('Judul dan Link project wajib diisi.');
      return;
    }

    let updatedProjects: Project[];
    if (editingProject) {
      updatedProjects = appData.projects.map((p) =>
        p.id === editingProject.id
          ? { ...(p as Project), ...projectForm } as Project
          : p
      );
    } else {
      const newProj: Project = {
        id: 'proj-' + Date.now(),
        judul: projectForm.judul || '',
        deskripsi: projectForm.deskripsi || '',
        gambar_url: projectForm.gambar_url || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
        link: projectForm.link || '',
        urutan: projectForm.urutan ?? (appData.projects.length + 1),
      };
      updatedProjects = [...appData.projects, newProj];
    }

    commitData({ ...appData, projects: updatedProjects }, 'Data project berhasil disimpan!');
    setIsAddingProject(false);
    setEditingProject(null);
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Yakin ingin menghapus project ini?')) {
      const filtered = appData.projects.filter((p) => p.id !== id);
      commitData({ ...appData, projects: filtered }, 'Project dihapus.');
    }
  };

  // 3. Skill Handlers
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const newSkill: Skill = {
      id: 'sk-' + Date.now(),
      nama: newSkillName.trim(),
      urutan: appData.skills.length + 1,
    };
    commitData({ ...appData, skills: [...appData.skills, newSkill] }, 'Skill ditambahkan!');
    setNewSkillName('');
  };

  const handleUpdateSkill = (id: string, newName: string) => {
    if (!newName.trim()) return;
    const updated = appData.skills.map((s) =>
      s.id === id ? { ...s, nama: newName.trim() } : s
    );
    commitData({ ...appData, skills: updated }, 'Skill diperbarui.');
    setEditingSkill(null);
  };

  const handleDeleteSkill = (id: string) => {
    const filtered = appData.skills.filter((s) => s.id !== id);
    commitData({ ...appData, skills: filtered }, 'Skill dihapus.');
  };

  // 4. Experience Handlers
  const handleSaveExp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expForm.instansi || !expForm.tahun) {
      alert('Nama Instansi dan Tahun wajib diisi.');
      return;
    }

    let updatedExp: Experience[];
    if (editingExp) {
      updatedExp = appData.experiences.map((exp) =>
        exp.id === editingExp.id ? { ...(exp as Experience), ...expForm } as Experience : exp
      );
    } else {
      const newExp: Experience = {
        id: 'exp-' + Date.now(),
        instansi: expForm.instansi || '',
        peran: expForm.peran || '',
        tahun: expForm.tahun || '',
        lokasi: expForm.lokasi || 'Indonesia',
        deskripsi: expForm.deskripsi || '',
        urutan: expForm.urutan ?? (appData.experiences.length + 1),
      };
      updatedExp = [...appData.experiences, newExp];
    }

    commitData({ ...appData, experiences: updatedExp }, 'Data pengalaman berhasil disimpan!');
    setIsAddingExp(false);
    setEditingExp(null);
  };

  const handleDeleteExp = (id: string) => {
    if (confirm('Hapus pengalaman ini?')) {
      const filtered = appData.experiences.filter((exp) => exp.id !== id);
      commitData({ ...appData, experiences: filtered }, 'Pengalaman dihapus.');
    }
  };

  // 5. Course Handlers
  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.nama_course || !courseForm.penyelenggara) {
      alert('Nama Course dan Penyelenggara wajib diisi.');
      return;
    }

    let updatedCourses: Course[];
    if (editingCourse) {
      updatedCourses = appData.courses.map((c) =>
        c.id === editingCourse.id ? { ...(c as Course), ...courseForm } as Course : c
      );
    } else {
      const newCourse: Course = {
        id: 'crs-' + Date.now(),
        nama_course: courseForm.nama_course || '',
        penyelenggara: courseForm.penyelenggara || '',
        tahun: courseForm.tahun || '',
        lokasi: courseForm.lokasi || 'Online',
        deskripsi: courseForm.deskripsi || '',
        urutan: courseForm.urutan ?? (appData.courses.length + 1),
      };
      updatedCourses = [...appData.courses, newCourse];
    }

    commitData({ ...appData, courses: updatedCourses }, 'Data pelatihan disimpan!');
    setIsAddingCourse(false);
    setEditingCourse(null);
  };

  const handleDeleteCourse = (id: string) => {
    if (confirm('Hapus data pelatihan ini?')) {
      const filtered = appData.courses.filter((c) => c.id !== id);
      commitData({ ...appData, courses: filtered }, 'Pelatihan dihapus.');
    }
  };

  // 6. Language Handlers
  const handleAddLanguage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLangName.trim()) return;

    const newLang: Language = {
      id: 'lang-' + Date.now(),
      nama_bahasa: newLangName.trim(),
      level: newLangLevel.trim() || 'Native',
    };
    commitData({ ...appData, languages: [...appData.languages, newLang] }, 'Bahasa ditambahkan!');
    setNewLangName('');
  };

  const handleDeleteLanguage = (id: string) => {
    const filtered = appData.languages.filter((l) => l.id !== id);
    commitData({ ...appData, languages: filtered }, 'Bahasa dihapus.');
  };

  // 7. Contact Handlers
  const handleSaveContacts = (e: React.FormEvent) => {
    e.preventDefault();
    commitData({ ...appData, contacts: contactForms }, 'Informasi kontak berhasil diperbarui!');
  };

  // 8. Test Keep-Alive Endpoint
  const testKeepalivePing = async () => {
    setIsTestingKeepalive(true);
    try {
      const res = await fetch('/api/cron/keepalive');
      const data = await res.json();
      setKeepaliveResult(data);
    } catch (err: any) {
      setKeepaliveResult({ ok: false, error: err.message });
    } finally {
      setIsTestingKeepalive(false);
    }
  };

  const handleResetData = () => {
    if (confirm('Kembalikan seluruh data ke contoh awal PRD? Seluruh modifikasi saat ini akan direset.')) {
      const resetData = resetToDefaultData();
      onDataChange(resetData);
      setProfileForm({ ...resetData.profile });
      setContactForms([...resetData.contacts]);
      showNotification('Data telah direset ke setelan awal default PRD.');
    }
  };

  const navItems = [
    { id: 'profile', label: 'Profil & Bio', icon: UserIcon },
    { id: 'projects', label: 'Project / Karya', icon: FolderKanban, count: appData.projects.length },
    { id: 'skills', label: 'Skills', icon: Sparkles, count: appData.skills.length },
    { id: 'experiences', label: 'Pengalaman', icon: Briefcase, count: appData.experiences.length },
    { id: 'courses', label: 'Pelatihan / Kursus', icon: Award, count: appData.courses.length },
    { id: 'languages', label: 'Bahasa', icon: Languages, count: appData.languages.length },
    { id: 'contacts', label: 'Kontak', icon: Mail, count: appData.contacts.length },
    { id: 'system', label: 'Supabase & Keep-Alive', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
              CMS
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-none">
                Admin Portofolio
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengelola Konten Mandiri
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onViewPublic}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
            >
              <Eye className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Lihat Halaman Publik</span>
              <span className="sm:hidden">Publik</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                await adminLogout();
                onLogout();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Save Notification Toast */}
      {saveAlert && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 text-sm animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveAlert}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Nav (Desktop) / Horizontal Scrollable Bar (Mobile) */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-2 sm:p-3 shadow-xs sticky top-20">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 py-2 hidden md:block">
              Navigasi Konten
            </div>
            
            {/* Scrollable list on mobile, vertical stack on desktop */}
            <nav className="flex md:flex-col overflow-x-auto md:overflow-x-visible gap-1 pb-1 md:pb-0 scrollbar-none">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id as TabType)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ml-2 ${
                          isActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">

          {/* ================= TAB 1: PROFIL & BIO ================= */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-8 shadow-xs">
              <div className="border-b border-slate-100 pb-4 mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Kelola Profil</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Ubah data diri, foto avatar, status, dan link resume untuk Hero section.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Upload Foto Profil Avatar (Bucket 'avatars') */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <ImageUploader
                    bucket="avatars"
                    currentImageUrl={profileForm.avatar_url}
                    onImageUploaded={(url) => setProfileForm({ ...profileForm, avatar_url: url })}
                    label="Foto Profil (Rasio 1:1, Sedikit Rounded)"
                    aspectRatio="square"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.nama}
                      onChange={(e) => setProfileForm({ ...profileForm, nama: e.target.value })}
                      placeholder="Contoh: Rania Pratama"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Bagian Nama Berwarna Biru (Nama Aksen)
                    </label>
                    <input
                      type="text"
                      value={profileForm.nama_aksen || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, nama_aksen: e.target.value })}
                      placeholder="Contoh: Rania"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Bagian ini akan disorot warna biru di Hero Section sesuai PRD 5.1.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Tagline / Jabatan
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.tagline}
                    onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                    placeholder="Contoh: Brand Designer & Visual Communication Specialist"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Deskripsi Singkat
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={profileForm.deskripsi}
                    onChange={(e) => setProfileForm({ ...profileForm, deskripsi: e.target.value })}
                    placeholder="Tuliskan deskripsi profil ringkas dan profesional..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Label Status (Di Bawah Foto)
                    </label>
                    <input
                      type="text"
                      value={profileForm.status}
                      onChange={(e) => setProfileForm({ ...profileForm, status: e.target.value })}
                      placeholder="Contoh: Terbuka untuk Kolaborasi"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Link Resume (Google Drive)</span>
                      <span className="text-[10px] text-blue-600 normal-case font-normal">
                        Conditional Rendering
                      </span>
                    </label>
                    <input
                      type="url"
                      value={profileForm.resume_url || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, resume_url: e.target.value })}
                      placeholder="https://drive.google.com/file/d/.../view"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Sesuai PRD 5.1: Tombol "Resume" di Hero hanya tampil bila link ini diisi. Jika kosong, tombol disembunyikan.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Perubahan Profil</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= TAB 2: PROJECTS / PORTFOLIO ================= */}
          {activeTab === 'projects' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-8 shadow-xs">
              <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Kelola Project & Portofolio</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Mendukung link eksternal, Google Drive (video/musik/animasi), dan gambar Supabase Storage bucket <code>projects</code>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProject(null);
                    setProjectForm({
                      judul: '',
                      deskripsi: '',
                      gambar_url: '',
                      link: '',
                      urutan: appData.projects.length + 1,
                    });
                    setIsAddingProject(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-blue-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Project</span>
                </button>
              </div>

              {/* Projects List (Responsive Table / Cards on mobile) */}
              <div className="space-y-4">
                {appData.projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-200 bg-slate-50/50 gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                        <img
                          src={proj.gambar_url}
                          alt={proj.judul}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                            #{proj.urutan}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {proj.judul}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 truncate max-w-md mt-0.5">
                          {proj.deskripsi}
                        </p>
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1 truncate"
                        >
                          <span>{proj.link}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProject(proj);
                          setProjectForm({ ...proj });
                          setIsAddingProject(true);
                        }}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition"
                        title="Edit Project"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-white rounded-lg transition"
                        title="Hapus Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {appData.projects.length === 0 && (
                  <p className="text-center py-8 text-sm text-slate-400 italic">Belum ada project.</p>
                )}
              </div>

              {/* Project Modal Form */}
              {isAddingProject && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">
                      {editingProject ? 'Edit Project' : 'Tambah Project Baru'}
                    </h3>

                    <form onSubmit={handleSaveProject} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Judul Project
                        </label>
                        <input
                          type="text"
                          required
                          value={projectForm.judul || ''}
                          onChange={(e) => setProjectForm({ ...projectForm, judul: e.target.value })}
                          placeholder="Contoh: Identitas Visual Kedai Kopi"
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Deskripsi Project
                        </label>
                        <textarea
                          rows={3}
                          value={projectForm.deskripsi || ''}
                          onChange={(e) => setProjectForm({ ...projectForm, deskripsi: e.target.value })}
                          placeholder="Jelaskan peran, cakupan karya, dan hasil project..."
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Image Upload for Projects */}
                      <div>
                        <ImageUploader
                          bucket="projects"
                          currentImageUrl={projectForm.gambar_url || ''}
                          onImageUploaded={(url) => setProjectForm({ ...projectForm, gambar_url: url })}
                          label="Gambar Project (Bucket 'projects')"
                          aspectRatio="video"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Link Project (Google Drive / URL Eksternal)
                        </label>
                        <input
                          type="url"
                          required
                          value={projectForm.link || ''}
                          onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })}
                          placeholder="https://drive.google.com/... atau https://behance.net/..."
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          Mendukung link Google Drive untuk media video, animasi, musik, atau dokumen portofolio.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Nomor Urutan Tampilan
                        </label>
                        <input
                          type="number"
                          value={projectForm.urutan ?? 1}
                          onChange={(e) => setProjectForm({ ...projectForm, urutan: parseInt(e.target.value) || 1 })}
                          className="w-24 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingProject(false)}
                          className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Simpan Project
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: SKILLS ================= */}
          {activeTab === 'skills' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-8 shadow-xs">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h2 className="text-xl font-bold text-slate-900">Kelola Skills</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Sesuai PRD 5.2: Skill hanya menampilkan nama instrumen/keahlian tanpa indikator level.
                </p>
              </div>

              {/* Add Skill Form */}
              <form onSubmit={handleAddSkill} className="flex gap-2 max-w-md mb-6">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="Nama skill baru (contoh: Canva, Word, dll.)"
                  className="flex-1 px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah</span>
                </button>
              </form>

              {/* Skills Badges List with delete/edit */}
              <div className="flex flex-wrap gap-2.5">
                {appData.skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800"
                  >
                    <span>{skill.nama}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="text-slate-400 hover:text-red-500 transition"
                      title="Hapus skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 4: EXPERIENCES ================= */}
          {activeTab === 'experiences' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-8 shadow-xs">
              <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Kelola Pengalaman</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Riwayat instansi, tahun, lokasi, dan deskripsi singkat sesuai PRD 5.4.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingExp(null);
                    setExpForm({
                      instansi: '',
                      peran: '',
                      tahun: '',
                      lokasi: 'Indonesia',
                      deskripsi: '',
                      urutan: appData.experiences.length + 1,
                    });
                    setIsAddingExp(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-blue-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Pengalaman</span>
                </button>
              </div>

              <div className="space-y-4">
                {appData.experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        {exp.instansi}
                      </h4>
                      {exp.peran && (
                        <p className="text-xs font-semibold text-blue-600">{exp.peran}</p>
                      )}
                      <p className="text-xs text-slate-500 mt-0.5">
                        {exp.tahun} • {exp.lokasi}
                      </p>
                      <p className="text-xs text-slate-600 mt-2 max-w-xl">
                        {exp.deskripsi}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingExp(exp);
                          setExpForm({ ...exp });
                          setIsAddingExp(true);
                        }}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteExp(exp.id)}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-white rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Exp Modal */}
              {isAddingExp && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">
                      {editingExp ? 'Edit Pengalaman' : 'Tambah Pengalaman Baru'}
                    </h3>

                    <form onSubmit={handleSaveExp} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Nama Instansi / Lembaga</label>
                        <input
                          type="text"
                          required
                          value={expForm.instansi || ''}
                          onChange={(e) => setExpForm({ ...expForm, instansi: e.target.value })}
                          placeholder="Nama instansi"
                          className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Jabatan / Peran</label>
                        <input
                          type="text"
                          value={expForm.peran || ''}
                          onChange={(e) => setExpForm({ ...expForm, peran: e.target.value })}
                          placeholder="Contoh: Brand Specialist"
                          className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">Tahun</label>
                          <input
                            type="text"
                            required
                            value={expForm.tahun || ''}
                            onChange={(e) => setExpForm({ ...expForm, tahun: e.target.value })}
                            placeholder="2022 — 2024"
                            className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">Lokasi</label>
                          <input
                            type="text"
                            value={expForm.lokasi || ''}
                            onChange={(e) => setExpForm({ ...expForm, lokasi: e.target.value })}
                            placeholder="Jakarta, Indonesia"
                            className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Deskripsi Singkat</label>
                        <textarea
                          rows={3}
                          value={expForm.deskripsi || ''}
                          onChange={(e) => setExpForm({ ...expForm, deskripsi: e.target.value })}
                          placeholder="Uraikan tanggung jawab dan kontribusi..."
                          className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                        />
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingExp(false)}
                          className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Simpan
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 5: COURSES ================= */}
          {activeTab === 'courses' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-8 shadow-xs">
              <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Kelola Pelatihan & Kursus</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Nama course, penyelenggara, tahun, lokasi, dan deskripsi sesuai PRD 5.5.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCourse(null);
                    setCourseForm({
                      nama_course: '',
                      penyelenggara: '',
                      tahun: '',
                      lokasi: 'Online',
                      deskripsi: '',
                      urutan: appData.courses.length + 1,
                    });
                    setIsAddingCourse(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-blue-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Pelatihan</span>
                </button>
              </div>

              <div className="space-y-4">
                {appData.courses.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{c.nama_course}</h4>
                      <p className="text-xs font-semibold text-blue-600">{c.penyelenggara}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {c.tahun} • {c.lokasi}
                      </p>
                      <p className="text-xs text-slate-600 mt-2 max-w-xl">{c.deskripsi}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCourse(c);
                          setCourseForm({ ...c });
                          setIsAddingCourse(true);
                        }}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCourse(c.id)}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-white rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Course Modal */}
              {isAddingCourse && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">
                      {editingCourse ? 'Edit Pelatihan' : 'Tambah Pelatihan Baru'}
                    </h3>

                    <form onSubmit={handleSaveCourse} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Nama Course / Pelatihan</label>
                        <input
                          type="text"
                          required
                          value={courseForm.nama_course || ''}
                          onChange={(e) => setCourseForm({ ...courseForm, nama_course: e.target.value })}
                          className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Penyelenggara</label>
                        <input
                          type="text"
                          required
                          value={courseForm.penyelenggara || ''}
                          onChange={(e) => setCourseForm({ ...courseForm, penyelenggara: e.target.value })}
                          className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">Tahun</label>
                          <input
                            type="text"
                            value={courseForm.tahun || ''}
                            onChange={(e) => setCourseForm({ ...courseForm, tahun: e.target.value })}
                            className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">Lokasi</label>
                          <input
                            type="text"
                            value={courseForm.lokasi || ''}
                            onChange={(e) => setCourseForm({ ...courseForm, lokasi: e.target.value })}
                            className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Deskripsi Singkat</label>
                        <textarea
                          rows={3}
                          value={courseForm.deskripsi || ''}
                          onChange={(e) => setCourseForm({ ...courseForm, deskripsi: e.target.value })}
                          className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                        />
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingCourse(false)}
                          className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Simpan
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 6: LANGUAGES ================= */}
          {activeTab === 'languages' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-8 shadow-xs">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h2 className="text-xl font-bold text-slate-900">Kelola Bahasa</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Sesuai PRD 5.6: Format teks "Bahasa — Level" tanpa progress bar visual.
                </p>
              </div>

              <form onSubmit={handleAddLanguage} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 max-w-xl">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Bahasa</label>
                  <input
                    type="text"
                    required
                    value={newLangName}
                    onChange={(e) => setNewLangName(e.target.value)}
                    placeholder="Contoh: Bahasa Jerman"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tingkat / Level</label>
                  <input
                    type="text"
                    required
                    value={newLangLevel}
                    onChange={(e) => setNewLangLevel(e.target.value)}
                    placeholder="Contoh: Intermediate"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Bahasa</span>
                  </button>
                </div>
              </form>

              <div className="space-y-2 max-w-lg">
                {appData.languages.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <div className="text-sm font-medium text-slate-800">
                      <span className="font-semibold text-slate-900">{l.nama_bahasa}</span>
                      <span className="text-blue-600 mx-2">—</span>
                      <span>{l.level}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteLanguage(l.id)}
                      className="text-slate-400 hover:text-red-500 transition"
                      title="Hapus bahasa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 7: CONTACTS ================= */}
          {activeTab === 'contacts' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-8 shadow-xs">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h2 className="text-xl font-bold text-slate-900">Kelola Informasi Kontak</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Saluran komunikasi publik (WhatsApp, Email, Instagram, LinkedIn) sesuai PRD 5.7.
                </p>
              </div>

              <form onSubmit={handleSaveContacts} className="space-y-4 max-w-2xl">
                {contactForms.map((item, idx) => (
                  <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                        {item.label || item.tipe}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Tipe: {item.tipe}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Teks Tampilan (Value)
                        </label>
                        <input
                          type="text"
                          value={item.value}
                          onChange={(e) => {
                            const copy = [...contactForms];
                            copy[idx].value = e.target.value;
                            setContactForms(copy);
                          }}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Link URL Aksi (Target)
                        </label>
                        <input
                          type="text"
                          value={item.link}
                          onChange={(e) => {
                            const copy = [...contactForms];
                            copy[idx].link = e.target.value;
                            setContactForms(copy);
                          }}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Kontak</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= TAB 8: SUPABASE & KEEP-ALIVE SYSTEM ================= */}
          {activeTab === 'system' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-8 shadow-xs space-y-8">
              
              {/* Keep-Alive Section (PRD Section 9) */}
              <div>
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    <span>Supabase Keep-Alive (Anti-Pause)</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Memastikan database Supabase free tier tidak pause dengan Vercel Cron setiap hari pukul 08:00 WIB (01:00 UTC).
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        Endpoint: <code className="text-blue-600 font-mono">/api/cron/keepalive</code>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Jadwal Cron Vercel: <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">0 1 * * *</code> (dikonfigurasi dalam <code>vercel.json</code>)
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={testKeepalivePing}
                      disabled={isTestingKeepalive}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTestingKeepalive ? 'animate-spin' : ''}`} />
                      <span>Uji Ping Keep-Alive</span>
                    </button>
                  </div>

                  {keepaliveResult && (
                    <div className="mt-3 p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg overflow-x-auto">
                      <pre>{JSON.stringify(keepaliveResult, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Supabase SQL Schema (PRD Section 8) */}
              <div>
                <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-600" />
                      <span>Skema Tabel & RLS Supabase (PRD Section 8)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Jalankan skrip SQL ini di tab <strong>SQL Editor</strong> pada dashboard Supabase Anda.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2000);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
                  </button>
                </div>

                <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs max-h-56 overflow-y-auto">
                  <pre>{SUPABASE_SQL_SCHEMA}</pre>
                </div>
              </div>

              {/* Danger Zone / Reset */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div>
                    <div className="text-xs font-bold text-amber-900">Reset ke Data Awal PRD</div>
                    <div className="text-xs text-amber-700 mt-0.5">
                      Mengembalikan seluruh data profil, skills, projects, pelatihan, dan kontak ke setelan default.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetData}
                    className="px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 text-xs font-semibold rounded-lg transition whitespace-nowrap"
                  >
                    Reset Data Default
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
