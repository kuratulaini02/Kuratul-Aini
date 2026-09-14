import React from 'react';
import { Project } from '../../types';
import { ExternalLink, FolderKanban, PlayCircle, Eye } from 'lucide-react';

interface ProjectsSectionProps {
  projects: Project[];
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
  // Sort projects by urutan
  const sortedProjects = [...projects].sort((a, b) => (a.urutan || 0) - (b.urutan || 0));

  const isGoogleDrive = (url: string) => {
    return url && (url.includes('drive.google.com') || url.includes('docs.google.com'));
  };

  return (
    <section id="project" className="py-14 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2.5">
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Portofolio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            Karya & Project Terpilih
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Koleksi proyek nyata, kampanye visual, dan dokumentasi karya yang telah diselesaikan.
          </p>
        </div>

        {/* Project Grid: 1 col on mobile, 2 on tablet, 3 on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {sortedProjects.map((project) => {
            const hasGdrive = isGoogleDrive(project.link);

            return (
              <div
                key={project.id}
                className="group flex flex-col bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-300"
              >
                {/* Project Image */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                  <img
                    src={project.gambar_url || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80'}
                    alt={project.judul}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  
                  {/* Overlay badge for media type */}
                  {hasGdrive && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/65 backdrop-blur-xs text-white text-xs font-medium flex items-center gap-1.5">
                      <PlayCircle className="w-3.5 h-3.5 text-blue-400" />
                      <span>Drive / Media</span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {project.judul}
                    </h3>
                    <p className="mt-2.5 text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {project.deskripsi}
                    </p>
                  </div>

                  {/* Action Link Button */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      {hasGdrive ? 'Google Drive Link' : 'Detail Project'}
                    </span>
                    <a
                      href={project.link || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-semibold transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Buka Project</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {sortedProjects.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">
            Belum ada project yang ditambahkan.
          </div>
        )}

      </div>
    </section>
  );
};
