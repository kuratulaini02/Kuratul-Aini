import React from 'react';
import { Lock } from 'lucide-react';

interface FooterProps {
  name: string;
  tagline: string;
  onNavigateAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ name, tagline, onNavigateAdmin }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-100 bg-white py-10 text-slate-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {name}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {tagline}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 text-center sm:text-right">
          <span>© {currentYear} {name}. Seluruh hak cipta dilindungi.</span>
          {onNavigateAdmin && (
            <button
              type="button"
              onClick={onNavigateAdmin}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-blue-600 transition px-2 py-1 rounded hover:bg-slate-50 text-[11px]"
              title="Portal Admin CMS"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Admin</span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
