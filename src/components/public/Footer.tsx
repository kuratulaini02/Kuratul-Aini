import React from 'react';

interface FooterProps {
  name: string;
  tagline: string;
}

export const Footer: React.FC<FooterProps> = ({ name, tagline }) => {
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

        <p className="text-xs text-slate-400 text-center sm:text-right">
          © {currentYear} {name}. Seluruh hak cipta dilindungi.
        </p>
      </div>
    </footer>
  );
};
