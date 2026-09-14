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
  const isLoginPage = currentPath === '/admin/login' || currentPath === '/login' || currentPath === '/admin';
  const isDashboard = currentPath === '/admin/dashboard' || currentPath === '/dashboard';

  return (
    <aside aria-label="Simulator Navigasi URL" className="fixed bottom-3 right-3 z-50">
      {/* Floating Pill Switcher */}
      <div className="bg-slate-900/95 backdrop-blur-md text-white text-xs rounded-2xl shadow-2xl border border-slate-700/80 p-1.5 transition-all">
        <div className="flex items-center gap-2 px-1.5 py-1">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>

          <span className="text-[11px] font-mono text-slate-300 hidden sm:inline">
            <strong className="text-blue-400">{currentPath}</strong>
          </span>

          {/* Quick 1-Click Action Button */}
          {!isLoginPage && !isDashboard ? (
            <button
              type="button"
              onClick={() => onNavigate('/admin/login')}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition active:scale-95"
              title="Akses Halaman Login Admin CMS"
            >
              <Shield className="w-3.5 h-3.5 text-blue-200" />
              <span>Login Admin</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition active:scale-95"
              title="Kembali ke Portofolio Publik"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Lihat Web Publik</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            title="Buka menu rute URL"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isExpanded && (
          <div className="pt-2 px-1 pb-1 border-t border-slate-800 mt-1 space-y-1 w-72">
            <div className="text-[10px] text-slate-400 px-2 pb-1 font-semibold uppercase tracking-wider flex items-center justify-between">
              <span>Navigasi Rute Cepat</span>
              <span className="text-[9px] text-emerald-400 font-mono">Status: Aktif</span>
            </div>

            {/* Path: / */}
            <button
              type="button"
              onClick={() => {
                onNavigate('/');
                setIsExpanded(false);
              }}
              className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between text-xs transition ${
                currentPath === '/' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <div>
                  <div className="font-medium">/ (Publik)</div>
                  <div className="text-[10px] opacity-75">Halaman depan portofolio</div>
                </div>
              </div>
            </button>

            {/* Path: /admin/login */}
            <button
              type="button"
              onClick={() => {
                onNavigate('/admin/login');
                setIsExpanded(false);
              }}
              className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between text-xs transition ${
                isLoginPage ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <div>
                  <div className="font-medium">/admin/login</div>
                  <div className="text-[10px] opacity-75">Login Supabase Auth CMS</div>
                </div>
              </div>
            </button>

            {/* Path: /admin/dashboard */}
            <button
              type="button"
              onClick={() => {
                onNavigate('/admin/dashboard');
                setIsExpanded(false);
              }}
              className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between text-xs transition ${
                isDashboard ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <div>
                  <div className="font-medium">/admin/dashboard</div>
                  <div className="text-[10px] opacity-75">
                    {isAdminLoggedIn ? 'Dashboard Terotentikasi' : 'Terproteksi (Harus Login)'}
                  </div>
                </div>
              </div>
            </button>

            {/* Path: /api/cron/keepalive */}
            <a
              href="/api/cron/keepalive"
              target="_blank"
              rel="noreferrer"
              className="w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between text-xs text-slate-300 hover:bg-slate-800 transition"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-rose-400" />
                <div>
                  <div className="font-medium">/api/cron/keepalive</div>
                  <div className="text-[10px] text-slate-400">Endpoint Ping Supabase</div>
                </div>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        )}
      </div>
    </aside>
  );
};
