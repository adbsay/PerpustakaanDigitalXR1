'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, BarChart3, Plus, Bell, User, Settings, HelpCircle, LogOut } from 'lucide-react';
import { NotificationProvider } from '@/context/NotificationContext';

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export default function PublisherLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);
  const [isBanned, setIsBanned] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hasSeenNotifs, setHasSeenNotifs] = useState(false);
  const [lang, setLang] = useState<'id' | 'en'>('id');

  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem('publisher_preferences');
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs);
        if (parsed.language === 'en' || parsed.language === 'id') {
          setLang(parsed.language);
        }
      }
    } catch {}

    if (typeof window !== 'undefined') {
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'shortcut icon';
        document.head.appendChild(link);
      }
      link.type = 'image/svg+xml';
      link.href = '/publisher-icon.svg';
    }
  }, []);

  const navLabels = {
    id: {
      dashboard: 'Dashboard',
      myEbooks: 'Katalog Ebook',
      analytics: 'Analitik',
      upload: 'Upload Ebook',
      notifTitle: 'Notifikasi Penerbit',
      noNotif: 'Tidak ada notifikasi baru',
      profile: 'Profil Penerbit',
      settings: 'Pengaturan Akun',
      help: 'Pusat Bantuan',
      logout: 'Keluar',
      bannedTitle: 'Akun Dinonaktifkan',
      bannedDesc: 'Akses akun Publisher Anda telah dinonaktifkan oleh Administrator sistem. Silakan hubungi tim dukungan jika Anda memerlukan klarifikasi lebih lanjut.',
      bannedLogout: 'Keluar dari Sistem'
    },
    en: {
      dashboard: 'Dashboard',
      myEbooks: 'My Ebooks',
      analytics: 'Analytics',
      upload: 'Upload Ebook',
      notifTitle: 'Publisher Notifications',
      noNotif: 'No new notifications',
      profile: 'Publisher Profile',
      settings: 'Account Settings',
      help: 'Help Center',
      logout: 'Log out',
      bannedTitle: 'Account Deactivated',
      bannedDesc: 'Your publisher account access has been suspended by the system administrator. Please reach out to support for further information.',
      bannedLogout: 'Log out from System'
    }
  }[lang];

  const navItems = [
    { label: navLabels.dashboard, href: '/publisher/dashboard', icon: LayoutDashboard },
    { label: navLabels.myEbooks, href: '/publisher/my-ebooks', icon: BookOpen },
    { label: navLabels.analytics, href: '/publisher/analytics', icon: BarChart3 },
  ];

  // Skip navbar for public / auth pages
  const isAuthPage = pathname?.includes('/publisher/auth');
  const publicPaths = ['/publisher', '/publisher/tentang-kami', '/publisher/faq', '/publisher/kontak'];
  const isPublicPage = isAuthPage || (pathname && publicPaths.includes(pathname));

  useEffect(() => {
    if (isPublicPage) return;

    const checkAuth = async () => {
      const token = localStorage.getItem('publisher_token');
      if (!token) {
        router.push('/publisher/auth/login');
        return;
      }
      try {
        const res = await fetch('/api/publisher/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const j = await res.json();
        if (j.success) {
          setUser(j.data);
          localStorage.setItem('publisher_user', JSON.stringify(j.data));
          
          // Fetch notifications (recent book status updates)
          try {
            const notifRes = await fetch('/api/publisher/notifications', {
              headers: { Authorization: `Bearer ${token}` }
            });
            const notifJson = await notifRes.json();
            if (notifJson.success) {
              setNotifications(prev => {
                if (prev.length !== notifJson.data.length) {
                  setHasSeenNotifs(false);
                }
                return notifJson.data;
              });
            }
          } catch {}
          
        } else {
          if (j.error === 'BANNED') {
            setIsBanned(true);
          } else {
            router.push('/publisher/auth/login');
          }
        }
      } catch {
        // Silently ignore network errors during poll
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 12000);
    return () => clearInterval(interval);
  }, [pathname, isPublicPage, router]);

  const handleLogout = async () => {
    await fetch('/api/publisher/auth/me', { method: 'POST' });
    localStorage.removeItem('publisher_token');
    localStorage.removeItem('publisher_user');
    setIsBanned(false);
    router.push('/publisher');
  };

  if (isPublicPage) return <>{children}</>;

  if (isBanned) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '24px', maxWidth: '420px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚫</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px', color: '#0F172A' }}>Akun Dinonaktifkan</h2>
          <p style={{ color: '#64748B', fontSize: '0.938rem', marginBottom: '32px', lineHeight: 1.6 }}>
            Akses akun Publisher Anda telah dinonaktifkan oleh Administrator sistem. Silakan hubungi tim dukungan jika Anda memerlukan klarifikasi lebih lanjut.
          </p>
          <button 
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-150 active:scale-[0.98] active:bg-red-800"
            onClick={handleLogout}
          >
            Keluar dari Sistem
          </button>
        </div>
      </div>
    );
  }

  return (
    <NotificationProvider>
      <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      
      {/* GLOBAL SAAS TACTILE STYLES */}
      <style>{`
        @keyframes subtleFadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        .pub-main-area {
          animation: subtleFadeIn 0.15s ease-out forwards;
        }

        /* Tactile B2B SaaS Button Styles */
        .btn-primary {
          background-color: #2563EB;
          color: #FFFFFF;
          font-weight: 600;
          transition: background-color 150ms ease, transform 150ms ease;
        }
        .btn-primary:hover {
          background-color: #1D4ED8;
        }
        .btn-primary:active {
          transform: scale(0.98);
          background-color: #1E40AF;
        }

        .btn-outline {
          background-color: #FFFFFF;
          border: 1px solid #E2E8F0;
          color: #334155;
          font-weight: 600;
          transition: background-color 150ms ease, transform 150ms ease, border-color 150ms ease;
        }
        .btn-outline:hover {
          background-color: #F8FAFC;
          border-color: #CBD5E1;
        }
        .btn-outline:active {
          transform: scale(0.98);
        }

        .btn-destructive {
          color: #DC2626;
          transition: background-color 150ms ease, transform 150ms ease;
        }
        .btn-destructive:hover {
          background-color: #FEF2F2;
        }
        .btn-destructive:active {
          transform: scale(0.98);
        }

        /* --- MOBILE SPECIFIC STYLES --- */
        .pub-mobile-bottom-nav {
          display: none;
        }
        .pub-mobile-top-bar {
          display: none;
        }
        .pub-mobile-profile-drawer {
          display: none;
        }

        @media (max-width: 768px) {
          .pub-desktop-nav {
            display: none !important;
          }
          .pub-mobile-top-bar {
            display: flex !important;
            height: 60px;
            background: #FFFFFF;
            border-bottom: 1px solid #E2E8F0;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            position: sticky;
            top: 0;
            z-index: 60;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          }
          .pub-mobile-profile-drawer {
            position: fixed;
            inset: 0;
            display: block;
            z-index: 120;
            pointer-events: none;
            opacity: 0;
            transition: opacity 220ms ease;
          }
          .pub-mobile-profile-drawer.open {
            opacity: 1;
            pointer-events: auto;
          }
          .pub-mobile-drawer-backdrop {
            position: absolute;
            inset: 0;
            background: rgba(15, 23, 42, 0.42);
            backdrop-filter: blur(2px);
          }
          .pub-mobile-drawer-panel {
            position: absolute;
            top: 0;
            right: 0;
            width: min(82vw, 340px);
            height: 100%;
            background: #FFFFFF;
            transform: translateX(100%);
            transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
            box-shadow: -12px 0 28px rgba(15, 23, 42, 0.12);
            display: flex;
            flex-direction: column;
          }
          .pub-mobile-profile-drawer.open .pub-mobile-drawer-panel {
            transform: translateX(0);
          }
          .pub-main-area {
            padding: 16px 16px 24px 16px !important;
          }
        }
      `}</style>

      {/* ---- TOP NAVBAR (DESKTOP) ---- */}
      <nav className="pub-desktop-nav" style={{ 
        height: '70px', 
        background: '#FFFFFF', 
        borderBottom: '1px solid #E2E8F0', 
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
      }}>
        <div style={{ 
          maxWidth: '1360px', 
          margin: '0 auto', 
          height: '100%', 
          padding: '0 24px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          
          {/* Left: Logo & Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
            
            {/* Logo */}
            <Link
              href="/publisher/dashboard"
              style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
            >
              <img 
                src="/publisher-icon.svg" 
                alt="Digital Library Logo" 
                style={{ 
                  width: '32px', 
                  height: '32px',
                  objectFit: 'contain',
                  filter: 'brightness(0) saturate(100%) invert(32%) sepia(87%) saturate(3065%) hue-rotate(215deg) brightness(97%) contrast(97%) drop-shadow(0 0 8px rgba(37, 99, 235, 0.6))'
                }} 
              />
              <div style={{ fontSize: '0.938rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                PERPUSTAKAAN DIGITAL
                <span style={{
                  fontSize: '0.625rem', fontWeight: 800, color: '#2563EB', background: '#EFF6FF',
                  padding: '2px 7px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.06em',
                  border: '1px solid #DBEAFE'
                }}>
                  Publisher
                </span>
              </div>
            </Link>

            {/* Nav Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {navItems.map(item => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      fontSize: '0.813rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#1D4ED8' : '#64748B',
                      textDecoration: 'none',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: isActive ? '#EFF6FF' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      transition: 'color 150ms ease, background-color 150ms ease'
                    }}
                  >
                    <Icon size={16} color={isActive ? '#2563EB' : '#94A3B8'} strokeWidth={isActive ? 2.2 : 1.8} />
                    {item.label}
                  </Link>
                );
              })}
            </div>

          </div>

          {/* Right: Actions, Notification, Profile */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

              {/* Upload Button */}
              <Link
                href="/publisher/upload"
                className="btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.813rem',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  boxShadow: '0 1px 3px rgba(37,99,235,0.2)'
                }}
              >
                <Plus size={16} strokeWidth={2.5} />
                {navLabels.upload}
              </Link>

              {/* Notification Bell */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => { setIsNotifOpen(!isNotifOpen); setIsDropdownOpen(false); setHasSeenNotifs(true); }}
                  className="btn-outline"
                  style={{ 
                    borderRadius: '50%',
                    width: '36px', height: '36px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', position: 'relative',
                    padding: 0
                  }}
                  title={navLabels.notifTitle}
                >
                  <Bell size={16} color="#64748B" />
                  {notifications.length > 0 && !hasSeenNotifs && (
                    <span style={{
                      position: 'absolute', top: '7px', right: '7px', background: '#EF4444',
                      width: '8px', height: '8px', borderRadius: '50%', border: '1.5px solid #FFFFFF'
                    }} />
                  )}
                </button>

                {isNotifOpen && (
                  <div style={{ 
                    position: 'absolute', top: '100%', right: 0, marginTop: '8px', 
                    background: '#FFFFFF', borderRadius: '14px', boxShadow: '0 12px 30px rgba(0,0,0,0.08)', 
                    border: '1px solid #E2E8F0', width: '300px', zIndex: 100, overflow: 'hidden'
                  }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9', fontWeight: 800, fontSize: '0.875rem', color: '#0F172A' }}>
                      {navLabels.notifTitle}
                    </div>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '28px 16px', textAlign: 'center', color: '#94A3B8', fontSize: '0.813rem' }}>
                          {navLabels.noNotif}
                        </div>
                      ) : (
                        notifications.map((notif: any, i: number) => (
                          <div key={i} style={{ 
                            padding: '12px 16px', borderBottom: i < notifications.length - 1 ? '1px solid #F8FAFC' : 'none',
                            fontSize: '0.813rem'
                          }}>
                            <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '3px' }}>
                              Ebook &quot;{notif.title}&quot; {notif.status === 'PUBLISHED' ? (lang === 'en' ? 'has been approved' : 'telah disetujui') : (lang === 'en' ? 'was rejected' : 'ditolak')}
                            </div>
                            <div style={{ color: '#94A3B8', fontSize: '0.688rem' }}>{new Date(notif.updatedAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID')}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsNotifOpen(false); }}
                  className="btn-outline"
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', 
                    padding: '5px 10px 5px 6px', borderRadius: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ 
                    width: '26px', height: '26px', borderRadius: '50%', background: '#0F172A', 
                    color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                    fontSize: '0.75rem', fontWeight: 800
                  }}>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span style={{ fontSize: '0.813rem', fontWeight: 700, color: '#0F172A', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name}
                  </span>
                  <span style={{ fontSize: '0.625rem', color: '#94A3B8' }}>▼</span>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div style={{ 
                    position: 'absolute', top: '100%', right: 0, marginTop: '8px', 
                    background: '#FFFFFF', borderRadius: '14px', 
                    boxShadow: '0 12px 30px rgba(0,0,0,0.1)', 
                    border: '1px solid #E2E8F0', width: '220px', overflow: 'hidden', zIndex: 100,
                    padding: '4px'
                  }}>
                    <div style={{ padding: '12px 14px', borderBottom: '1px solid #F1F5F9' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A', marginBottom: '2px' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', wordBreak: 'break-all' }}>{user.email}</div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '4px 0' }}>
                      <Link 
                        href="/publisher/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px',
                          fontSize: '0.813rem', color: '#334155', textDecoration: 'none', fontWeight: 500,
                          transition: 'background-color 150ms ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <User size={15} color="#64748B" />
                        {navLabels.profile}
                      </Link>

                      <Link 
                        href="/publisher/settings"
                        onClick={() => setIsDropdownOpen(false)}
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px',
                          fontSize: '0.813rem', color: '#334155', textDecoration: 'none', fontWeight: 500,
                          transition: 'background-color 150ms ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <Settings size={15} color="#64748B" />
                        {navLabels.settings}
                      </Link>

                      <Link 
                        href="/publisher/help"
                        onClick={() => setIsDropdownOpen(false)}
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px',
                          fontSize: '0.813rem', color: '#334155', textDecoration: 'none', fontWeight: 500,
                          transition: 'background-color 150ms ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <HelpCircle size={15} color="#64748B" />
                        {navLabels.help}
                      </Link>

                      <div style={{ borderTop: '1px solid #F1F5F9', margin: '4px 0' }} />

                      <button 
                        onClick={handleLogout} 
                        className="btn-destructive"
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px',
                          fontSize: '0.813rem', fontWeight: 600, background: 'none', border: 'none', 
                          cursor: 'pointer', width: '100%', textAlign: 'left'
                        }}
                      >
                        <LogOut size={15} color="#DC2626" />
                        {navLabels.logout}
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </nav>

      {/* ---- MOBILE TOP BAR ---- */}
      <div className="pub-mobile-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img 
            src="/publisher-icon.svg" 
            alt="Logo" 
            style={{ 
              width: '28px', 
              height: '28px', 
              objectFit: 'contain',
              filter: 'brightness(0) saturate(100%) invert(32%) sepia(87%) saturate(3065%) hue-rotate(215deg) brightness(97%) contrast(97%) drop-shadow(0 0 8px rgba(37, 99, 235, 0.6))' 
            }} 
          />
          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
            PUBLISHER
          </div>
        </div>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { setIsNotifOpen(!isNotifOpen); setIsDropdownOpen(false); setHasSeenNotifs(true); }}
                style={{ 
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '6px'
                }}
              >
                <Bell size={20} color="#64748B" />
                {notifications.length > 0 && !hasSeenNotifs && (
                  <span style={{
                    position: 'absolute', top: '4px', right: '4px', background: '#EF4444',
                    width: '8px', height: '8px', borderRadius: '50%', border: '1.5px solid #FFFFFF'
                  }} />
                )}
              </button>
            </div>

            <button
              onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsNotifOpen(false); }}
              style={{
                width: '32px', height: '32px', borderRadius: '50%', background: '#0F172A',
                color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', fontSize: '0.875rem', fontWeight: 800,
                border: 'none', cursor: 'pointer', padding: 0
              }}
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </button>
          </div>
        )}
      </div>

      <div className={`pub-mobile-profile-drawer ${isDropdownOpen ? 'open' : ''}`}>
        <div className="pub-mobile-drawer-backdrop" onClick={() => setIsDropdownOpen(false)} />
        <aside className="pub-mobile-drawer-panel">
          <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#0F172A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontWeight: 800 }}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || 'P'
                )}
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>{user?.name || 'Publisher'}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || 'publisher@libra.id'}</div>
              </div>
            </div>
            <button
              onClick={() => setIsDropdownOpen(false)}
              style={{ border: 'none', background: '#F8FAFC', color: '#334155', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem' }}
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 14px 0', gap: '8px' }}>
            {navItems.map(item => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsDropdownOpen(false)}
                  style={{
                    textDecoration: 'none',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px', borderRadius: '12px',
                    background: isActive ? '#EFF6FF' : '#F8FAFC',
                    color: isActive ? '#1D4ED8' : '#334155',
                    fontWeight: isActive ? 700 : 600,
                    border: isActive ? '1px solid #DBEAFE' : '1px solid transparent'
                  }}
                >
                  <Icon size={18} color={isActive ? '#2563EB' : '#64748B'} strokeWidth={2} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <Link
              href="/publisher/upload"
              onClick={() => setIsDropdownOpen(false)}
              style={{
                textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: '12px',
                background: pathname === '/publisher/upload' ? '#EFF6FF' : '#F8FAFC',
                color: pathname === '/publisher/upload' ? '#1D4ED8' : '#334155',
                fontWeight: pathname === '/publisher/upload' ? 700 : 600,
                border: pathname === '/publisher/upload' ? '1px solid #DBEAFE' : '1px solid transparent'
              }}
            >
              <Plus size={18} color={pathname === '/publisher/upload' ? '#2563EB' : '#64748B'} strokeWidth={2.5} />
              <span>{navLabels.upload}</span>
            </Link>
          </div>

          <div style={{ borderTop: '1px solid #E2E8F0', marginTop: '16px', padding: '16px 14px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link href="/publisher/profile" onClick={() => setIsDropdownOpen(false)} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '12px', color: '#334155', background: '#F8FAFC', fontWeight: 600 }}>
              <User size={18} color="#64748B" />
              <span>{navLabels.profile}</span>
            </Link>
            <Link href="/publisher/settings" onClick={() => setIsDropdownOpen(false)} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '12px', color: '#334155', background: '#F8FAFC', fontWeight: 600 }}>
              <Settings size={18} color="#64748B" />
              <span>{navLabels.settings}</span>
            </Link>
            <Link href="/publisher/help" onClick={() => setIsDropdownOpen(false)} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '12px', color: '#334155', background: '#F8FAFC', fontWeight: 600 }}>
              <HelpCircle size={18} color="#64748B" />
              <span>{navLabels.help}</span>
            </Link>

            <button
              onClick={handleLogout}
              style={{ marginTop: '8px', border: 'none', background: '#FEE2E2', color: '#B91C1C', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px 14px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              <LogOut size={18} color="#B91C1C" />
              {navLabels.logout}
            </button>
          </div>
        </aside>
      </div>

      {/* ---- MAIN AREA WITH RAPID SUBTLE FADE TRANSITION (150ms) ---- */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        <main 
          key={pathname}
          className="pub-main-area"
          style={{ 
            flex: 1, 
            padding: '28px 32px 64px', 
            maxWidth: '1600px', 
            margin: '0 auto', 
            width: '100%' 
          }}
        >
          {children}
        </main>
      </div>
    </div>
  </NotificationProvider>
);
}
