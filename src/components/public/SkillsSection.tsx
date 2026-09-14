import React from 'react';
import { Skill } from '../../types';
import { Sparkles } from 'lucide-react';

interface SkillsSectionProps {
  skills: Skill[];
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skills }) => {
  return (
    <section id="skills" className="py-12 sm:py-16 bg-slate-50/60 border-y border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Keahlian</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Skills & Keahlian Utama
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Kumpulan instrumen, perangkat lunak, dan kompetensi teruji yang saya gunakan dalam mengeksekusi karya profesional.
          </p>
        </div>

        {/* Skills List: Sederhana berisi nama skill saja, TIDAK ADA indikator level */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 max-w-4xl mx-auto">
          {skills && skills.length > 0 ? (
            skills.map((skill) => (
              <div
                key={skill.id}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-white border border-slate-200/80 text-slate-800 text-sm sm:text-base font-medium shadow-xs hover:border-blue-400 hover:text-blue-600 hover:shadow-sm transition-all select-none"
              >
                {skill.nama}
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 italic">Belum ada data skill.</p>
          )}
        </div>

      </div>
    </section>
  );
};
