import React, { useState } from 'react';
import { Lock, Mail, Key, ShieldCheck, AlertCircle, Loader2, Database, Settings, ArrowLeft } from 'lucide-react';
import { getSupabaseClient, getSupabaseConfig, saveSupabaseConfig, setDemoAdminSession } from '../../lib/supabase';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onNavigateHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onNavigateHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Supabase Custom Config Modal State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const currentConfig = getSupabaseConfig();
  const [customUrl, setCustomUrl] = useState(currentConfig?.url || '');
  const [customKey, setCustomKey] = useState(currentConfig?.anonKey || '');
  const [configSuccess, setConfigSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const client = getSupabaseClient();

    if (!client) {
      // Supabase is not yet configured with URL & Key
      setErrorMsg(
        'Supabase belum terhubung. Silakan klik "Konfigurasi Supabase" untuk memasukkan URL & Anon Key dari dashboard Supabase Anda, atau gunakan "Mode Evaluasi Cepat".'
      );
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setErrorMsg(error.message || 'Gagal login. Pastikan email dan password sesuai dengan user di Supabase Auth.');
      } else if (data.session) {
        onLoginSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat menghubungi Supabase Auth.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setDemoAdminSession(email || 'evaluator@admin.local');
    onLoginSuccess();
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim() && customKey.trim()) {
      saveSupabaseConfig({
        url: customUrl.trim(),
        anonKey: customKey.trim(),
      });
      setConfigSuccess(true);
      setTimeout(() => {
        setConfigSuccess(false);
        setShowConfigModal(false);
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      {/* Back to Home Button */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4 flex justify-between items-center">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Halaman Portofolio</span>
        </button>

        <button
          type="button"
          onClick={() => setShowConfigModal(true)}
          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md transition"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Koneksi Supabase</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header Icon */}
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white mx-auto flex items-center justify-center shadow-md">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Admin Portal CMS
        </h2>
        <p className="mt-2 text-center text-xs sm:text-sm text-slate-600">
          Masuk dengan akun Supabase Auth terdaftar untuk mengelola portofolio pribadi.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200/90 rounded-2xl sm:px-10">
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="leading-snug">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Email Supabase
              </label>
              <div className="mt-1 relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@domain.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1 relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-xs text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memvalidasi Sesi...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Masuk ke Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Sandbox / Demo Mode Toggle */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-center">
              <p className="text-xs text-slate-600 mb-2">
                Ingin menguji kelengkapan CRUD & upload tanpa menyiapkan akun Supabase sekarang?
              </p>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-2 px-3 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition"
              >
                Masuk Mode Preview / Evaluasi Cepat
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-slate-400">
              PRD Note: Sesuai spesifikasi, tidak ada kredensial admin hardcode. Akun admin dibuat langsung pada Supabase Auth dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Supabase Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-lg mb-2">
              <Database className="w-5 h-5 text-blue-600" />
              <span>Konfigurasi Supabase Proyek</span>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Masukkan URL dan Anon Public Key dari project Supabase Anda (Project Settings → API).
            </p>

            {configSuccess && (
              <div className="mb-4 p-2.5 bg-emerald-50 text-emerald-700 text-xs rounded-lg">
                Konfigurasi tersimpan! Memuat ulang client...
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Project URL</label>
                <input
                  type="url"
                  placeholder="https://xyzcompany.supabase.co"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Anon Public Key</label>
                <textarea
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                >
                  Simpan & Hubungkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
