import React from 'react';
import { Course } from '../../types';
import { Award, Calendar, MapPin, Building } from 'lucide-react';

interface CoursesSectionProps {
  courses: Course[];
}

export const CoursesSection: React.FC<CoursesSectionProps> = ({ courses }) => {
  const sorted = [...courses].sort((a, b) => (a.urutan || 0) - (b.urutan || 0));

  return (
    <section id="pelatihan" className="py-14 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2.5">
            <Award className="w-3.5 h-3.5" />
            <span>Sertifikasi & Kursus</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Pelatihan & Pengembangan Diri
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Sertifikasi formal, lokakarya khusus, dan program peningkatan kompetensi profesional.
          </p>
        </div>

        {/* List of Courses */}
        <div className="grid grid-cols-1 gap-5 sm:gap-6">
          {sorted.map((course) => (
            <div
              key={course.id}
              className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-2">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {course.nama_course}
                  </h3>
                  <p className="text-sm font-medium text-blue-600 flex items-center gap-1.5 mt-0.5">
                    <Building className="w-3.5 h-3.5 text-blue-500" />
                    <span>{course.penyelenggara}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md font-medium text-slate-700">
                    <Calendar className="w-3 h-3 text-blue-600" />
                    {course.tahun}
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {course.lokasi}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mt-2 pt-2 border-t border-slate-100">
                {course.deskripsi}
              </p>
            </div>
          ))}

          {sorted.length === 0 && (
            <div className="text-center py-10 text-slate-500 text-sm">
              Belum ada data pelatihan/course.
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
