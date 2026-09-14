import React from 'react';
import { Experience } from '../../types';
import { Briefcase, Calendar, MapPin } from 'lucide-react';

interface ExperienceSectionProps {
  experiences: Experience[];
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experiences }) => {
  const sorted = [...experiences].sort((a, b) => (a.urutan || 0) - (b.urutan || 0));

  return (
    <section id="pengalaman" className="py-14 sm:py-20 bg-slate-50/50 border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2.5">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Rekam Jejak</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Pengalaman Kerja & Organisasi
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Perjalanan karir profesional dan kontribusi dalam berbagai lembaga serta proyek kolaboratif.
          </p>
        </div>

        {/* List of Experience */}
        <div className="space-y-6">
          {sorted.map((exp) => (
            <div
              key={exp.id}
              className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    {exp.instansi}
                  </h3>
                  {exp.peran && (
                    <p className="text-sm sm:text-base font-semibold text-blue-600 mt-0.5">
                      {exp.peran}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md font-medium text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    {exp.tahun}
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {exp.lokasi}
                  </span>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                {exp.deskripsi}
              </p>
            </div>
          ))}

          {sorted.length === 0 && (
            <div className="text-center py-10 text-slate-500 text-sm">
              Belum ada data pengalaman.
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
