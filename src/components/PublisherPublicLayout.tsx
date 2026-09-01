'use client';

import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, BookOpen, Info, HelpCircle, PhoneCall, Sparkles } from 'lucide-react';

interface PublisherPublicLayoutProps {
  children: React.ReactNode;
  activePage?: 'beranda' | 'tentang' | 'faq' | 'kontak';
  onNavigate?: (page: 'beranda' | 'tentang' | 'faq' | 'kontak') => void;
  isAuthPage?: boolean;
  onAuthClick?: (mode: 'login' | 'register') => void;
}

export default function PublisherPublicLayout({ 
  children, 
  activePage = 'beranda', 
  onNavigate,
  isAuthPage = false,
  onAuthClick
}: PublisherPublicLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  const isLandingPage = pathname === '/publisher';
  const isTransparentNavbar = pathname === '/publisher' || pathname === '/publisher/tentang-kami' || pathname === '/publisher/faq';

  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClosingDrawer, setIsClosingDrawer] = useState(false);

  // Swipe gesture references
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
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

    // If on landing page, check if already logged in
    if (isLandingPage) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('publisher_token') : null;
      if (token) {
        fetch('/api/publisher/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(r => r.json())
          .then(j => {
            if (j.success) {
              router.replace('/publisher/dashboard');
            } else {
              localStorage.removeItem('publisher_token');
              localStorage.removeItem('publisher_user');
              setIsCheckingAuth(false);
            }
          })
          .catch(() => setIsCheckingAuth(false));
      } else {
        setIsCheckingAuth(false);
      }
    } else {
      setIsCheckingAuth(false);
    }
  }, [isLandingPage, router]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on page switch or auth modal open
  useEffect(() => {
    setMobileMenuOpen(false);
    setIsClosingDrawer(false);
  }, [activePage, isAuthPage, pathname]);

  const handleCloseMenu = () => {
    if (isClosingDrawer) return;
    setIsClosingDrawer(true);
    setTimeout(() => {
      setMobileMenuOpen(false);
      setIsClosingDrawer(false);
    }, 230);
  };

  const handleToggleMenu = () => {
    if (mobileMenuOpen) {
      handleCloseMenu();
    } else {
      setMobileMenuOpen(true);
      setIsClosingDrawer(false);
    }
  };

  const handleMobileNav = (page: 'beranda' | 'tentang' | 'faq' | 'kontak') => {
    handleCloseMenu();
    setTimeout(() => {
      if (onNavigate) {
        onNavigate(page);
      } else {
        router.push(page === 'beranda' ? '/publisher' : `/publisher?view=${page}`);
      }
    }, 100);
  };

  const handleMobileAuth = (mode: 'login' | 'register') => {
    handleCloseMenu();
    setTimeout(() => {
      if (onAuthClick) {
        onAuthClick(mode);
      } else {
        router.push(`/publisher/auth/${mode}`);
      }
    }, 100);
  };

  // Touch gesture handlers for closing drawer on swipe left or swipe up
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Swipe left (deltaX < -40) or swipe up (deltaY < -40) closes the drawer with exit animation
    if (deltaX < -40 || deltaY < -40) {
      handleCloseMenu();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // While checking auth on landing page, show a blank/loading state to avoid flash
  if (isLandingPage && isCheckingAuth) {
    return (
      <div style={{ minHeight: '100vh', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.2)', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', fontFamily: 'var(--font-inter, sans-serif)', color: '#1a1a1a', background: '#FFFFFF', minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      
      {/* Loading overlay when redirecting to dashboard */}
      {isRedirecting && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            width: 52, height: 52,
            border: '3px solid rgba(255,255,255,0.2)',
            borderTop: '3px solid #FFFFFF',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .ios-btn {
          transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.3s ease, border-color 0.3s ease;
        }
        
        .ios-btn:hover {
          transform: scale(1.04);
        }
        
        .ios-btn:active {
          transform: scale(0.96);
        }

        .nav-link {
          display: inline-block;
          transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease;
        }

        .nav-link:hover {
          opacity: 0.8;
        }

        /* Responsive Navbar & Footer Rules */
        .pub-nav-container {
          padding: 24px 32px;
        }
        .pub-desktop-nav {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .pub-mobile-nav-toggle {
          display: none;
        }
        .pub-footer-container {
          padding: 40px 48px;
        }
        .pub-footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        @media (max-width: 768px) {
          .pub-nav-container {
            padding: 16px 20px !important;
          }
          .pub-desktop-nav {
            display: none !important;
          }
          .pub-mobile-nav-toggle {
            display: flex !important;
            align-items: center;
          }
          .pub-footer-container {
            padding: 28px 20px !important;
          }
          .pub-footer-content {
            flex-direction: column !important;
            text-align: center !important;
            gap: 14px !important;
          }
        }
      `}</style>
      
      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', width: '100%' }}>
        
        {/* Background Image Layer for Landing */}
        {isLandingPage && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'url("https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(2, 6, 23, 0.85)' }} />
          </div>
        )}

        {/* Navbar */}
        <nav 
          className="pub-nav-container"
          style={{ 
            position: isTransparentNavbar ? 'absolute' : 'relative',
            top: 0, left: 0, right: 0,
            zIndex: 50,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            background: isTransparentNavbar ? 'transparent' : '#FFFFFF', 
            borderBottom: isTransparentNavbar ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #EAEAEA',
            color: isTransparentNavbar ? '#FFFFFF' : '#1a1a1a'
          }}
        >
          {/* Logo & App Name (Shared Layout Element - never disappears) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/publisher" className="ios-btn" style={{ display: 'flex', alignItems: 'center' }}>
              <img 
                src="/publisher-icon.svg" 
                alt="Digital Library Logo" 
                style={{ 
                  width: '36px', 
                  height: '36px',
                  objectFit: 'contain',
                  filter: isTransparentNavbar 
                    ? 'brightness(0) saturate(100%) invert(67%) sepia(81%) saturate(2256%) hue-rotate(180deg) brightness(102%) contrast(98%) drop-shadow(0 0 10px rgba(56, 189, 248, 0.6))' 
                    : 'brightness(0) saturate(100%) invert(32%) sepia(87%) saturate(3065%) hue-rotate(215deg) brightness(97%) contrast(97%) drop-shadow(0 0 8px rgba(37, 99, 235, 0.6))'
                }} 
              />
            </Link>
            <Link href="/publisher" className="nav-link" style={{ fontWeight: 800, fontSize: '14px', lineHeight: 1.2, color: 'inherit', textDecoration: 'none', letterSpacing: '-0.01em' }}>
              PERPUSTAKAAN<br/>DIGITAL
            </Link>
          </div>
          
          {/* Right Navigation & Auth Actions - DESKTOP (>= 769px) */}
          <div 
            className="pub-desktop-nav"
            style={{
              opacity: isAuthPage ? 0 : 1,
              transform: isAuthPage ? 'translateX(20px)' : 'translateX(0)',
              pointerEvents: isAuthPage ? 'none' : 'auto',
              transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div style={{ display: 'flex', gap: '32px', fontSize: '14px', fontWeight: 600 }}>
              {onNavigate ? (
                <>
                  <button
                    onClick={() => onNavigate('beranda')}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: isTransparentNavbar ? (activePage === 'beranda' ? '#60A5FA' : '#E2E8F0') : (activePage === 'beranda' ? '#2563EB' : 'inherit'),
                      fontWeight: activePage === 'beranda' ? 800 : 600,
                      fontSize: '14px',
                      padding: 0,
                      transition: 'color 0.2s ease'
                    }}
                  >
                    Beranda
                  </button>
                  <button
                    onClick={() => onNavigate('tentang')}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: isTransparentNavbar ? (activePage === 'tentang' ? '#60A5FA' : '#E2E8F0') : (activePage === 'tentang' ? '#2563EB' : 'inherit'),
                      fontWeight: activePage === 'tentang' ? 800 : 600,
                      fontSize: '14px',
                      padding: 0,
                      transition: 'color 0.2s ease'
                    }}
                  >
                    Tentang Kami
                  </button>
                  <button
                    onClick={() => onNavigate('faq')}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: isTransparentNavbar ? (activePage === 'faq' ? '#60A5FA' : '#E2E8F0') : (activePage === 'faq' ? '#2563EB' : 'inherit'),
                      fontWeight: activePage === 'faq' ? 800 : 600,
                      fontSize: '14px',
                      padding: 0,
                      transition: 'color 0.2s ease'
                    }}
                  >
                    FAQ
                  </button>
                  <button
                    onClick={() => onNavigate('kontak')}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: isTransparentNavbar ? (activePage === 'kontak' ? '#60A5FA' : '#E2E8F0') : (activePage === 'kontak' ? '#2563EB' : 'inherit'),
                      fontWeight: activePage === 'kontak' ? 800 : 600,
                      fontSize: '14px',
                      padding: 0,
                      transition: 'color 0.2s ease'
                    }}
                  >
                    Kontak
                  </button>
                </>
              ) : (
                <>
                  <Link href="/publisher" style={{ color: activePage === 'beranda' ? (isTransparentNavbar ? '#60A5FA' : '#2563EB') : 'inherit', textDecoration: 'none' }}>Beranda</Link>
                  <Link href="/publisher?view=tentang" style={{ color: activePage === 'tentang' ? (isTransparentNavbar ? '#60A5FA' : '#2563EB') : 'inherit', textDecoration: 'none' }}>Tentang Kami</Link>
                  <Link href="/publisher?view=faq" style={{ color: activePage === 'faq' ? (isTransparentNavbar ? '#60A5FA' : '#2563EB') : 'inherit', textDecoration: 'none' }}>FAQ</Link>
                  <Link href="/publisher?view=kontak" style={{ color: activePage === 'kontak' ? (isTransparentNavbar ? '#60A5FA' : '#2563EB') : 'inherit', textDecoration: 'none' }}>Kontak</Link>
                </>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {onAuthClick ? (
                <>
                  <button
                    onClick={() => onAuthClick('login')}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: isTransparentNavbar ? '#FFFFFF' : '#1a1a1a',
                      cursor: 'pointer',
                      padding: '8px 16px',
                      transition: 'opacity 0.2s ease'
                    }}
                  >
                    Masuk
                  </button>
                  <button
                    onClick={() => onAuthClick('register')}
                    className="ios-btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      background: '#2563EB',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 700,
                      padding: '10px 24px',
                      borderRadius: '999px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
                    }}
                  >
                    Daftar
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/publisher/auth/login"
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: isTransparentNavbar ? '#FFFFFF' : '#1a1a1a',
                      textDecoration: 'none',
                      padding: '8px 16px'
                    }}
                  >
                    Masuk
                  </Link>
                  <Link 
                    href="/publisher/auth/register"
                    className="ios-btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      background: '#2563EB',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 700,
                      padding: '10px 24px',
                      borderRadius: '999px',
                      textDecoration: 'none',
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
                    }}
                  >
                    Daftar
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Actions (< 769px) - Clean single 44x44px hamburger icon */}
          {!isAuthPage && (
            <div className="pub-mobile-nav-toggle">
              <button
                onClick={handleToggleMenu}
                aria-label={mobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
                style={{
                  background: isTransparentNavbar ? 'rgba(255, 255, 255, 0.1)' : '#F8FAFC',
                  border: isTransparentNavbar ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #E2E8F0',
                  color: isTransparentNavbar ? '#FFFFFF' : '#0F172A',
                  width: '44px',
                  height: '44px',
                  minWidth: '44px',
                  minHeight: '44px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          )}
        </nav>

        {/* Mobile Navigation Drawer Overlay (Backdrop + White Content-Hugging Sheet) */}
        {mobileMenuOpen && !isAuthPage && (
          <div 
            onClick={handleCloseMenu}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 90,
              background: 'rgba(2, 6, 23, 0.65)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              animation: isClosingDrawer ? 'pubFadeOut 0.24s ease forwards' : 'pubFadeIn 0.24s ease forwards',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start'
            }}
          >
            <style>{`
              @keyframes pubFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes pubFadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
              }
              @keyframes pubSlideDown {
                from { transform: translateY(-100%); opacity: 0.8; }
                to { transform: translateY(0); opacity: 1; }
              }
              @keyframes pubSlideUp {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(-100%); opacity: 0.8; }
              }
            `}</style>

            {/* White Content-Hugging Panel */}
            <div
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              style={{
                width: '100%',
                background: '#FFFFFF',
                borderBottom: '1px solid #E2E8F0',
                borderRadius: '0 0 28px 28px',
                padding: '22px 20px 24px',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
                animation: isClosingDrawer ? 'pubSlideUp 0.24s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'pubSlideDown 0.26s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Drawer Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div>
                  <div style={{
                    color: '#2563EB',
                    background: '#EFF6FF',
                    border: '1px solid #DBEAFE',
                    borderRadius: '999px',
                    padding: '3px 10px',
                    fontWeight: 800,
                    fontSize: '0.688rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    marginBottom: '6px'
                  }}>
                    <Sparkles size={12} /> RUANG PENERBIT
                  </div>
                  <div style={{ fontSize: '1.188rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
                    Navigasi Publik
                  </div>
                </div>

                {/* Close button with 44x44px target */}
                <button
                  onClick={handleCloseMenu}
                  aria-label="Tutup Menu"
                  style={{
                    background: '#F1F5F9',
                    border: '1px solid #E2E8F0',
                    color: '#475569',
                    width: '44px',
                    height: '44px',
                    minWidth: '44px',
                    minHeight: '44px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
                {[
                  { key: 'beranda', label: 'Beranda Publisher', icon: BookOpen },
                  { key: 'tentang', label: 'Tentang Kami', icon: Info },
                  { key: 'faq', label: 'Pusat Bantuan & FAQ', icon: HelpCircle },
                  { key: 'kontak', label: 'Hubungi Kemitraan', icon: PhoneCall },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleMobileNav(item.key as any)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '14px',
                        background: isActive ? '#EFF6FF' : '#F8FAFC',
                        border: isActive ? '1.5px solid #3B82F6' : '1px solid #E2E8F0',
                        color: isActive ? '#1D4ED8' : '#334155',
                        fontSize: '0.938rem',
                        fontWeight: isActive ? 800 : 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Icon size={18} color={isActive ? '#2563EB' : '#64748B'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Auth Actions (Single Path to Daftar & Masuk) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => handleMobileAuth('register')}
                  style={{
                    width: '100%',
                    background: '#2563EB',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.938rem',
                    padding: '12px',
                    minHeight: '44px',
                    borderRadius: '14px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Daftar Akun Publisher
                </button>

                <button
                  onClick={() => handleMobileAuth('login')}
                  style={{
                    width: '100%',
                    background: '#F8FAFC',
                    color: '#0F172A',
                    fontWeight: 700,
                    fontSize: '0.938rem',
                    padding: '12px',
                    minHeight: '44px',
                    borderRadius: '14px',
                    border: '1px solid #CBD5E1',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Masuk ke Dashboard
                </button>
              </div>

              {/* Clean Support Footer Note */}
              <div style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid #F1F5F9',
                textAlign: 'center',
                fontSize: '0.75rem',
                color: '#64748B'
              }}>
                Dukungan Kemitraan:{' '}
                <span style={{ color: '#2563EB', fontWeight: 600 }}>support@perpustakaandigital.id</span>
              </div>

            </div>
          </div>
        )}

        {/* Page Body / Content Injection */}
        {children}

        {/* Shared Public Footer */}
        <footer 
          className="pub-footer-container"
          style={{ 
            marginTop: 'auto', 
            background: '#020617', 
            borderTop: '1px solid rgba(255, 255, 255, 0.08)', 
            color: '#64748B', 
            fontSize: '13px',
            position: 'relative',
            zIndex: 20
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <div className="pub-footer-content">
              <div>
                © {new Date().getFullYear()} Perpustakaan Digital. All rights reserved.
              </div>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', justifyContent: 'center' }}>
                <Link href="#" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s ease' }}>Kebijakan Privasi</Link>
                <Link href="#" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s ease' }}>Syarat & Ketentuan</Link>
                <Link href="/publisher?view=faq" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s ease' }}>Bantuan</Link>
              </div>
            </div>
          </div>
        </footer>

      </div>

    </div>
  );
}
