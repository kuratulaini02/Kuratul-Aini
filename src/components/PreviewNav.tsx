import React, { useState } from 'react';
import { Compass, ExternalLink, Shield, Globe, Terminal, ChevronUp, ChevronDown } from 'lucide-react';

interface PreviewNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isAdminLoggedIn: boolean;
}

export const PreviewNav: React.FC<PreviewNavProps> = ({
  currentPath,
  onNavigate,
  isAdminLoggedIn,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside aria-label="Simulator Navigasi URL" className="fixed bottom-3 right-3 z-50">
      {/* Floating Pill Switcher */}
      <div className="bg-slate-900/90 backdrop-blur-md text-white text-xs rounded-2xl shadow-xl border border-slate-700/80 p-1.5 transition-all">
        <div className="flex items-center gap-2 px-2 py-1">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-mono text-slate-300">
            Path: <strong className="text-blue-400">{currentPath}</strong>
          </span>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            title="Buka menu navigasi rute URL"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isExpanded && (
          <div className="pt-2 px-1 pb-1 border-t border-slate-800 mt-1 space-y-1 w-64">
            <div className="text-[10px] text-slate-400 px-2 pb-1 font-semibold uppercase tracking-wider">
              Simulasi URL PRD
            </div>

            {/* Path: / */}
            <button
              type="button"
              onClick={() => {
                onNavigate('/');
                setIsExpanded(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition ${
                currentPath === '/' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>/ (Publik)</span>
              </div>
              <span className="text-[10px] opacity-70">Single Page</span>
            </button>

            {/* Path: /admin/login */}
            <button
              type="button"
              onClick={() => {
                onNavigate('/admin/login');
                setIsExpanded(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition ${
                currentPath === '/admin/login' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>/admin/login</span>
              </div>
              <span className="text-[10px] opacity-70">Supabase Auth</span>
            </button>

            {/* Path: /admin/dashboard */}
            <button
              type="button"
              onClick={() => {
                onNavigate('/admin/dashboard');
                setIsExpanded(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition ${
                currentPath === '/admin/dashboard' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>/admin/dashboard</span>
              </div>
              <span className="text-[10px] opacity-70">
                {isAdminLoggedIn ? 'Terotentikasi' : 'Protected'}
              </span>
            </button>

            {/* Path: /api/cron/keepalive */}
            <a
              href="/api/cron/keepalive"
              target="_blank"
              rel="noreferrer"
              className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs text-slate-300 hover:bg-slate-800 transition"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-rose-400" />
                <span>/api/cron/keepalive</span>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <div className="text-[9px] text-slate-400 px-2 pt-1 border-t border-slate-800/80 leading-tight">
              Sesuai PRD, halaman publik tidak memiliki link ke admin. Buka langsung via URL di atas.
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
