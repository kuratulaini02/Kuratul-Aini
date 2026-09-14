import React, { useState } from 'react';
import { ContactItem } from '../../types';
import { Mail, MessageSquare, Instagram, Linkedin, Check, Copy, ExternalLink } from 'lucide-react';

interface ContactSectionProps {
  contacts: ContactItem[];
  profileName: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ contacts, profileName }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getIcon = (tipe: string) => {
    switch (tipe.toLowerCase()) {
      case 'whatsapp':
        return <MessageSquare className="w-5 h-5 text-emerald-600" />;
      case 'email':
        return <Mail className="w-5 h-5 text-blue-600" />;
      case 'instagram':
        return <Instagram className="w-5 h-5 text-rose-600" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5 text-sky-600" />;
      default:
        return <ExternalLink className="w-5 h-5 text-slate-600" />;
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="kontak" className="py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2.5">
            <Mail className="w-3.5 h-3.5" />
            <span>Terhubung</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            Mari Berdiskusi & Berkolaborasi
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Terbuka untuk tawaran proyek, konsultasi perancangan, kemitraan strategis, maupun sapaan hangat.
          </p>
        </div>

        {/* Contact Cards Grid: 1 col on mobile, 2 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {contacts.map((c) => {
            const isCopied = copiedId === c.id;

            return (
              <div
                key={c.id}
                className="flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors">
                    {getIcon(c.tipe)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {c.label || c.tipe}
                    </div>
                    <div className="text-sm sm:text-base font-semibold text-slate-900 truncate mt-0.5">
                      {c.value}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-3 flex-shrink-0">
                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => copyToClipboard(c.id, c.value)}
                    title="Salin ke clipboard"
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {/* Direct Link Button */}
                  <a
                    href={c.link || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title={`Buka ${c.label}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Message CTA */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center shadow-md">
          <h3 className="text-xl sm:text-2xl font-bold">Siap Mengembangkan Ide Bersama?</h3>
          <p className="mt-2 text-blue-100 text-sm sm:text-base max-w-xl mx-auto">
            Kirimkan brief atau jadwalkan pertemuan singkat untuk mendiskusikan kebutuhan Anda bersama {profileName}.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {contacts.find((c) => c.tipe === 'whatsapp') && (
              <a
                href={contacts.find((c) => c.tipe === 'whatsapp')?.link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-white text-blue-700 font-semibold text-sm hover:bg-blue-50 shadow-sm transition"
              >
                Chat WhatsApp
              </a>
            )}
            {contacts.find((c) => c.tipe === 'email') && (
              <a
                href={contacts.find((c) => c.tipe === 'email')?.link}
                className="px-5 py-2.5 rounded-xl bg-blue-800/80 text-white font-semibold text-sm hover:bg-blue-900 border border-blue-500/30 transition"
              >
                Kirim Email
              </a>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
