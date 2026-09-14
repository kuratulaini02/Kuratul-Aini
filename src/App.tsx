import React, { useState, useEffect } from 'react';
import { AppData } from './types';
import { initialData } from './lib/defaultData';
import { loadAppData, getAdminSession } from './lib/supabase';
import { Navbar } from './components/public/Navbar';
import { HeroSection } from './components/public/HeroSection';
import { SkillsSection } from './components/public/SkillsSection';
import { ProjectsSection } from './components/public/ProjectsSection';
import { ExperienceSection } from './components/public/ExperienceSection';
import { CoursesSection } from './components/public/CoursesSection';
import { LanguagesSection } from './components/public/LanguagesSection';
import { ContactSection } from './components/public/ContactSection';
import { Footer } from './components/public/Footer';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PreviewNav } from './components/PreviewNav';

export default function App() {
  const [appData, setAppData] = useState<AppData>(initialData);
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize data and check authentication session
  useEffect(() => {
    async function init() {
      try {
        const { data } = await loadAppData();
        setAppData(data);

        // Check session
        const session = await getAdminSession();
        setIsAdminLoggedIn(!!session.user);
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    init();

    // Listen to browser navigation (back/forward)
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update Dynamic Document Title & Meta (PRD Section 5.8)
  useEffect(() => {
    if (appData?.profile?.nama) {
      const dynamicTitle = `${appData.profile.nama} | Personal Portfolio Website`;
      document.title = dynamicTitle;

      // Update OG title and description if elements exist
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', dynamicTitle);

      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc && appData.profile.deskripsi) {
        ogDesc.setAttribute('content', appData.profile.deskripsi);
      }
    }
  }, [appData?.profile?.nama, appData?.profile?.deskripsi]);

  // Navigate helper with HTML5 history
  const navigate = (path: string) => {
    try {
      window.history.pushState({}, '', path);
    } catch (e) {
      // ignore security restrictions in restricted iframes
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Synchronize admin status on logout / login
  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    navigate('/admin/dashboard');
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    navigate('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-slate-500">Memuat portofolio...</p>
      </div>
    );
  }

  // Normalize path
  const cleanPath = currentPath.toLowerCase().replace(/\/$/, '') || '/';

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* Route: /admin/login */}
      {cleanPath === '/admin/login' && (
        <AdminLogin
          onLoginSuccess={handleLoginSuccess}
          onNavigateHome={() => navigate('/')}
        />
      )}

      {/* Route: /admin/dashboard (Protected) */}
      {cleanPath === '/admin/dashboard' && (
        isAdminLoggedIn ? (
          <AdminDashboard
            appData={appData}
            onDataChange={(newData) => setAppData(newData)}
            onLogout={handleLogout}
            onViewPublic={() => navigate('/')}
          />
        ) : (
          <AdminLogin
            onLoginSuccess={handleLoginSuccess}
            onNavigateHome={() => navigate('/')}
          />
        )
      )}

      {/* Route: / (Public Single-Page Portfolio) */}
      {cleanPath !== '/admin/login' && cleanPath !== '/admin/dashboard' && (
        <div className="relative">
          {/* Public Navbar (Section scroll links, NO admin link) */}
          <Navbar profile={appData.profile} />

          <main>
            {/* 5.1 Hero Section (Mobile-first, 1:1 rounded photo on left, conditional Resume button) */}
            <HeroSection profile={appData.profile} />

            {/* 5.2 Skills Section (Clean badge boxes, NO level indicator) */}
            <SkillsSection skills={appData.skills} />

            {/* 5.3 Projects Section (Cards with image, title, description, external/Drive link) */}
            <ProjectsSection projects={appData.projects} />

            {/* 5.4 Experience Section (Instansi, tahun, lokasi, deskripsi) */}
            <ExperienceSection experiences={appData.experiences} />

            {/* 5.5 Course & Training Section (Nama, penyelenggara, tahun, lokasi, deskripsi) */}
            <CoursesSection courses={appData.courses} />

            {/* 5.6 Languages Section (Format teks "Bahasa — Level", NO progress bars) */}
            <LanguagesSection languages={appData.languages} />

            {/* 5.7 Contact Section (WhatsApp, Email, Instagram, LinkedIn) */}
            <ContactSection contacts={appData.contacts} profileName={appData.profile.nama} />
          </main>

          {/* Public Minimalist Footer (NO admin link) */}
          <Footer name={appData.profile.nama} tagline={appData.profile.tagline} />
        </div>
      )}

      {/* Discreet Simulator URL Navigator for Preview Testing */}
      <PreviewNav
        currentPath={currentPath}
        onNavigate={navigate}
        isAdminLoggedIn={isAdminLoggedIn}
      />
    </div>
  );
}
