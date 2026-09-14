import React from 'react';
import { ArrowDown, ExternalLink, FileText, Send } from 'lucide-react';
import { Profile } from '../../types';

interface HeroSectionProps {
  profile: Profile;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ profile }) => {
  // Determine highlighted blue portion of name
  let accentName = profile.nama_aksen;
  let restName = profile.nama_sisa;

  if (!accentName && profile.nama) {
    const parts = profile.nama.trim().split(' ');
    accentName = parts[0];
    restName = parts.slice(1).join(' ');
  }

  const handleScrollTo = (id: string) => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="tentang" className="relative py-12 md:py-20 lg:py-24 overflow-hidden">
      {/* Subtle geometric background accent */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-blue-50/60 rounded-full blur-3xl opacity-70 pointer-events-none" />
      <div className="absolute bottom-10 left-10 -z-10 w-80 h-80 bg-slate-50 rounded-full blur-2xl opacity-60 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile-first: 1 column on mobile, 2 columns on desktop (md/lg) */}
        <div className="flex flex-col md:flex-row items-center md:items-start lg:items-center gap-10 lg:gap-14">
          
          {/* Kolom Kiri (Desktop) / Atas (Mobile): Foto Profil Rasio 1:1, sedikit rounded (bukan lingkaran penuh) */}
          <div className="w-full sm:w-80 md:w-80 lg:w-96 flex-shrink-0 flex flex-col items-center">
            <div className="relative group w-64 sm:w-72 md:w-full aspect-square">
              {/* Decorative subtle border frame */}
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-blue-600 to-blue-200 rounded-3xl opacity-30 blur-[2px] group-hover:opacity-40 transition duration-300" />
              
              {/* Main 1:1 Photo Container */}
              <div className="relative w-full h-full rounded-2xl md:rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                <img
                  src={profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80'}
                  alt={profile.nama}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top transition duration-500 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to placeholder if url fails
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80';
                  }}
                />
              </div>
            </div>

            {/* Label status kecil di bawah foto: contoh "• Terbuka untuk Kolaborasi" */}
            <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100/80 text-blue-800 text-xs sm:text-sm font-medium shadow-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>{profile.status || 'Terbuka untuk Kolaborasi'}</span>
            </div>
          </div>

          {/* Kolom Kanan (Desktop) / Bawah (Mobile): Konten Teks */}
          <div className="w-full flex-1 text-center md:text-left">
            {/* Badge kecil di atas nama: "Portofolio Profesional" */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 text-blue-700 font-semibold text-xs tracking-wider uppercase mb-4 border border-blue-100">
              Portofolio Profesional
            </div>

            {/* Nama besar, bagian nama utama berwarna biru */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              <span className="text-blue-600">{accentName}</span>
              {restName ? ` ${restName}` : ''}
            </h1>

            {/* Tagline / Jabatan */}
            <p className="mt-3 text-lg sm:text-xl font-medium text-slate-700">
              {profile.tagline}
            </p>

            {/* Deskripsi singkat */}
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              {profile.deskripsi}
            </p>

            {/* Tombol Aksi */}
            <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-3.5">
              {/* Primary: Hubungi Saya (Biru) */}
              <button
                type="button"
                onClick={() => handleScrollTo('kontak')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium text-sm sm:text-base hover:bg-blue-700 active:scale-95 shadow-sm hover:shadow transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Hubungi Saya</span>
              </button>

              {/* Secondary / Outline: Lihat Project */}
              <button
                type="button"
                onClick={() => handleScrollTo('project')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium text-sm sm:text-base hover:bg-slate-50 active:scale-95 transition-all"
              >
                <span>Lihat Project</span>
                <ArrowDown className="w-4 h-4 text-slate-500" />
              </button>

              {/* CONDITIONAL RENDERING: Resume — tampil HANYA JIKA admin mengisi link resume di dashboard */}
              {profile.resume_url && profile.resume_url.trim() !== '' && (
                <a
                  href={profile.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 text-slate-800 font-medium text-sm sm:text-base hover:bg-slate-200 active:scale-95 transition-all"
                  title="Buka Resume di tab baru"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Resume</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </a>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
