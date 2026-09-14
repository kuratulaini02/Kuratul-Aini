import React from 'react';
import { Language } from '../../types';
import { Languages } from 'lucide-react';

interface LanguagesSectionProps {
  languages: Language[];
}

export const LanguagesSection: React.FC<LanguagesSectionProps> = ({ languages }) => {
  return (
    <section id="bahasa" className="py-12 sm:py-16 bg-slate-50/60 border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Languages className="w-3.5 h-3.5" />
            <span>Kemampuan Bahasa</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Bahasa
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Bahasa komunikasi yang dikuasai untuk koordinasi lokal maupun internasional.
          </p>
        </div>

        {/* Format teks murni sesuai PRD Section 5.6: "Bahasa Indonesia — Native", "Bahasa Inggris — Intermediate" (TIDAK ADA progress bar) */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {languages && languages.length > 0 ? (
            languages.map((lang) => (
              <div
                key={lang.id}
                className="px-6 py-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xs text-base sm:text-lg font-medium text-slate-800"
              >
                <span className="font-semibold text-slate-900">{lang.nama_bahasa}</span>
                <span className="text-blue-600 mx-2 font-light">—</span>
                <span className="text-slate-600">{lang.level}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 italic">Belum ada data bahasa.</p>
          )}
        </div>

      </div>
    </section>
  );
};
