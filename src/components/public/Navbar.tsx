import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Profile } from '../../types';

interface NavbarProps {
  profile: Profile;
}

export const Navbar: React.FC<NavbarProps> = ({ profile }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: 'Tentang', href: '#tentang' },
    { label: 'Skills', href: '#skills' },
    { label: 'Project', href: '#project' },
    { label: 'Pengalaman', href: '#pengalaman' },
    { label: 'Pelatihan', href: '#pelatihan' },
    { label: 'Bahasa', href: '#bahasa' },
    { label: 'Kontak', href: '#kontak' },
  ];

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <a 
          href="#tentang" 
          onClick={(e) => handleScroll(e, '#tentang')} 
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm group-hover:bg-blue-700 transition">
            {profile.nama ? profile.nama.charAt(0) : 'P'}
          </div>
          <span className="font-semibold tracking-tight text-slate-900 text-lg">
            {profile.nama || 'Portofolio'}
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleScroll(e, link.href)}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 rounded-md hover:bg-slate-50 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#kontak"
            onClick={(e) => handleScroll(e, '#kontak')}
            className="ml-2 px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition"
          >
            Hubungi
          </a>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          aria-label="Buka Menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-100 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleScroll(e, link.href)}
              className="block px-3 py-2.5 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2">
            <a
              href="#kontak"
              onClick={(e) => handleScroll(e, '#kontak')}
              className="block w-full text-center px-4 py-2.5 text-base font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
            >
              Hubungi Saya
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
