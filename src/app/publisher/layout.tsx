'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

const navItems = [
  { label: 'Dashboard', href: '/publisher/dashboard' },
  { label: 'My Ebooks', href: '/publisher/my-ebooks' },
  { label: 'Analytics', href: '/publisher/analytics' },
];

export default function PublisherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isBanned, setIsBanned] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hasSeenNotifs, setHasSeenNotifs] = useState(false);

  // Page transition
  const [transitionOrigin, setTransitionOrigin] = useState<string>('center top');
  const [animKey, setAnimKey] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  // Store previous children so old page stays visible behind the new one
  const prevChildrenRef = useRef<React.ReactNode>(null);

  // Skip navbar for public pages
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
                // If there are new notifications, show the badge again
                if (prev.length !== notifJson.data.length) {
                  setHasSeenNotifs(false);
                }
                return notifJson.data;
              });
            }
          } catch(e) {}
          
        } else {
          if (j.error === 'BANNED') {
            setIsBanned(true);
          } else {
            router.push('/publisher/auth/login');
          }
        }
      } catch (e) {
        // Silently ignore network errors during poll
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 10000);
    return () => clearInterval(interval);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/publisher/auth/me', { method: 'POST' });
    localStorage.removeItem('publisher_token');
    localStorage.removeItem('publisher_user');
    setIsBanned(false);
    router.push('/publisher');
  };

  // Handle nav click with page transition
  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === pathname) return;
    e.preventDefault();

    // Get click position relative to main content area
    const mainEl = document.getElementById('pub-main-content');
    const rect = e.currentTarget.getBoundingClientRect();
    const mainRect = mainEl?.getBoundingClientRect() || { left: 0, top: 0 };

    const originX = rect.left + rect.width / 2 - mainRect.left;
    const originY = rect.top + rect.height / 2 - mainRect.top;

    // Save current children as "old page"
    prevChildrenRef.current = children;

    setTransitionOrigin(`${originX}px ${originY}px`);
    setIsAnimating(true);
    setAnimKey(prev => prev + 1);

    // Navigate
    router.push(href);
  }, [pathname, router, children]);

  // Clear animation state after it finishes
  const handleAnimEnd = useCallback(() => {
    setIsAnimating(false);
    prevChildrenRef.current = null;
  }, []);

  if (isPublicPage) return <>{children}</>;

  if (isBanned) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
        <div style={{ background: 'white', padding: 40, borderRadius: 24, maxWidth: 420, textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🚫</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12, color: '#1A1A1A' }}>Akun Diblokir</h2>
          <p style={{ color: '#6B6B6B', fontSize: '0.938rem', marginBottom: 32, lineHeight: 1.6 }}>
            Mohon maaf, akses akun Publisher Anda telah dinonaktifkan oleh Administrator karena melanggar kebijakan kami. Anda tidak lagi dapat mengelola buku atau mengakses dashboard.
          </p>
          <button className="btn btn-primary btn-lg" style={{ width: '100%', background: '#FF3B30', border: 'none' }} onClick={handleLogout}>
            Keluar dari Sistem
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9F9F9', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes pub-page-zoom-in {
          0% {
            transform: scale(0);
            opacity: 0;
            border-radius: 16px;
          }
          40% {
            opacity: 1;
            border-radius: 12px;
          }
          100% {
            transform: scale(1);
            opacity: 1;
            border-radius: 0px;
          }
        }

        .pub-nav-link {
          transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
          position: relative;
        }
        .pub-nav-link:hover {
          transform: translateY(-1px);
          color: #1A1A1A !important;
          background: #F4F3F0 !important;
        }
        .pub-nav-link:active {
          transform: scale(0.95);
        }
      `}</style>

      {/* ---- NAVBAR ---- */}
      <nav style={{ 
        height: '70px', 
        background: '#FFFFFF', 
        borderBottom: '1px solid #EBEBEB', 
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          height: '100%', 
          padding: '0 24px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
            {/* Logo */}
            <a
              href="/publisher/dashboard"
              onClick={(e) => handleNavClick(e, '/publisher/dashboard')}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', cursor: 'pointer' }}
            >
              <img src="/logo.svg" alt="Digital Library Logo" style={{ width: '32px', height: '32px' }} />
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: '10px' }}>
                Digital Library
                <span style={{
                  fontSize: '0.688rem', fontWeight: 700, color: '#6B6B6B', background: '#F4F3F0',
                  padding: '3px 9px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.04em'
                }}>Publisher</span>
              </div>
            </a>

            {/* Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {navItems.map(item => {
                const isActive = pathname === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="pub-nav-link"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#1A1A1A' : '#6B6B6B',
                      textDecoration: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      background: isActive ? '#F4F3F0' : 'transparent',
                    }}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>
          </div>

          {/* User Profile & Notifications */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

              {/* Upload New — primary action */}
              <a
                href="/publisher/upload"
                onClick={(e) => handleNavClick(e, '/publisher/upload')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', background: '#1A1A1A', color: '#FFFFFF',
                  fontSize: '0.875rem', fontWeight: 600, padding: '9px 16px', borderRadius: '6px',
                  textDecoration: 'none', transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#000000'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#1A1A1A'; }}
              >
                Upload New
              </a>

              {/* Notification Bell */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => { setIsNotifOpen(!isNotifOpen); setIsDropdownOpen(false); setHasSeenNotifs(true); }}
                  style={{ 
                    background: 'white', border: '1px solid #EBEBEB', borderRadius: '50%',
                    width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4B4B4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.268 21a2 2 0 0 0 3.464 0"/>
                    <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>
                  </svg>
                  {notifications.length > 0 && !hasSeenNotifs && (
                    <span style={{
                      position: 'absolute', top: '2px', right: '2px', background: '#FF3B30',
                      width: '9px', height: '9px', borderRadius: '50%', border: '1.5px solid #FFFFFF'
                    }} />
                  )}
                </button>

                {isNotifOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: '8px', 
                    background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
                    border: '1px solid #EBEBEB', width: '280px', zIndex: 100 
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #F4F3F0', fontWeight: 600, fontSize: '0.875rem' }}>
                      Notifikasi
                    </div>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '24px 16px', textAlign: 'center', color: '#9B9B9B', fontSize: '0.813rem' }}>
                          Tidak ada notifikasi baru
                        </div>
                      ) : (
                        notifications.map((notif: any, i: number) => (
                          <div key={i} style={{ 
                            padding: '12px 16px', borderBottom: i < notifications.length - 1 ? '1px solid #F4F3F0' : 'none',
                            fontSize: '0.813rem'
                          }}>
                            <div style={{ fontWeight: 600, color: '#1A1A1A', marginBottom: '4px' }}>
                              Buku &quot;{notif.title}&quot; {notif.status === 'PUBLISHED' ? 'disetujui' : 'ditolak'}
                            </div>
                            <div style={{ color: '#6B6B6B', fontSize: '0.75rem' }}>{new Date(notif.updatedAt).toLocaleDateString()}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsNotifOpen(false); }}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', 
                  border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: '8px',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F4F3F0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ 
                  width: '24px', height: '24px', borderRadius: '50%', background: '#F4F3F0', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' 
                }}>
                  {user.avatar ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '12px' }}>👤</span>}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A' }}>{user.name}</span>
                <span style={{ fontSize: '0.7rem', color: '#6B6B6B', marginLeft: '4px' }}>▼</span>
              </button>

              {/* Dropdown */}
              {isDropdownOpen && (
                <div style={{ 
                  position: 'absolute', top: '100%', right: 0, marginTop: '8px', 
                  background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
                  border: '1px solid #EBEBEB', width: '200px', overflow: 'hidden', zIndex: 100 
                }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid #F4F3F0' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '2px' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B6B6B', wordBreak: 'break-all' }}>{user.email}</div>
                  </div>
                  <div style={{ padding: '8px' }}>
                    <a href="/publisher/profile"
                      onClick={(e) => { setIsDropdownOpen(false); handleNavClick(e, '/publisher/profile'); }}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px',
                        fontSize: '0.875rem', color: '#1A1A1A', textDecoration: 'none', transition: 'background 0.2s' 
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F4F3F0'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ width: '16px', textAlign: 'center' }}>👤</span> Profil Saya
                    </a>
                    <button onClick={handleLogout} style={{ 
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px',
                      fontSize: '0.875rem', color: '#FF3B30', background: 'none', border: 'none', 
                      cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'background 0.2s' 
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#FFF5F5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ width: '16px', textAlign: 'center' }}>🚪</span> Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      </nav>

      {/* ---- MAIN ---- */}
      <div id="pub-main-content" style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
        {/* Old page — stays visible behind during animation */}
        {isAnimating && prevChildrenRef.current && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            background: '#F9F9F9', overflowY: 'auto'
          }}>
            <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
              {prevChildrenRef.current}
            </div>
          </div>
        )}

        {/* Current page — animated zoom-in when transitioning */}
        <div
          key={animKey}
          onAnimationEnd={handleAnimEnd}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background: '#F9F9F9',
            overflowY: isAnimating ? 'hidden' : 'auto',
            transformOrigin: transitionOrigin,
            animation: isAnimating ? 'pub-page-zoom-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards' : 'none',
            boxShadow: isAnimating ? '0 25px 60px rgba(0,0,0,0.12)' : 'none',
          }}
        >
          <main style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
