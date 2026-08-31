'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface PublisherPublicLayoutProps {
  children: React.ReactNode;
  activePage?: 'beranda' | 'tentang' | 'faq' | 'kontak';
  onNavigate?: (page: 'beranda' | 'tentang' | 'faq' | 'kontak') => void;
  isAuthPage?: boolean;
  onAuthClick?: (mode: 'login' | 'register') => void;
}

export default function PublisherPublicLayout({ 
  children, 
  activePage, 
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

  useEffect(() => {
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
        <nav style={{ 
          position: isTransparentNavbar ? 'absolute' : 'relative',
          top: 0, left: 0, right: 0,
          zIndex: 50,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          padding: '24px 32px', 
          background: isTransparentNavbar ? 'transparent' : '#FFFFFF', 
          borderBottom: isTransparentNavbar ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #EAEAEA',
          color: isTransparentNavbar ? '#FFFFFF' : '#1a1a1a'
        }}>
          {/* Logo & App Name (Shared Layout Element - never disappears) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/publisher" className="ios-btn" style={{ display: 'flex' }}>
              <img src="/logo.svg" alt="Digital Library Logo" style={{ width: '36px', height: '36px' }} />
            </Link>
            <Link href="/publisher" className="nav-link" style={{ fontWeight: 800, fontSize: '15px', lineHeight: 1.2, color: 'inherit', textDecoration: 'none', letterSpacing: '-0.01em' }}>
              PERPUSTAKAAN<br/>DIGITAL
            </Link>
          </div>
          
          {/* Right Navigation & Auth Actions (Fades out when isAuthPage is true) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
            opacity: isAuthPage ? 0 : 1,
            transform: isAuthPage ? 'translateX(20px)' : 'translateX(0)',
            pointerEvents: isAuthPage ? 'none' : 'auto',
            transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
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
                  <Link href="/publisher?view=beranda" className="nav-link" style={{ color: isTransparentNavbar ? '#E2E8F0' : 'inherit', textDecoration: 'none' }}>Beranda</Link>
                  <Link href="/publisher?view=tentang" className="nav-link" style={{ color: isTransparentNavbar ? '#E2E8F0' : 'inherit', textDecoration: 'none' }}>Tentang Kami</Link>
                  <Link href="/publisher?view=faq" className="nav-link" style={{ color: isTransparentNavbar ? '#E2E8F0' : 'inherit', textDecoration: 'none' }}>FAQ</Link>
                  <Link href="/publisher?view=kontak" className="nav-link" style={{ color: isTransparentNavbar ? '#E2E8F0' : 'inherit', textDecoration: 'none' }}>Kontak</Link>
                </>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {onAuthClick ? (
                <>
                  <button 
                    onClick={() => onAuthClick('login')} 
                    className="ios-btn" 
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px 16px', 
                      fontSize: '14px', fontWeight: 600, 
                      color: isTransparentNavbar ? '#FFFFFF' : '#1a1a1a', 
                      transition: 'color 0.2s ease'
                    }}
                  >
                    Masuk
                  </button>
                  <button 
                    onClick={() => onAuthClick('register')} 
                    className="ios-btn" 
                    style={{
                      border: 'none',
                      cursor: 'pointer',
                      padding: '10px 24px', 
                      background: '#2563EB', 
                      borderRadius: '999px', 
                      fontSize: '14px', fontWeight: 700, color: '#FFFFFF',
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Daftar
                  </button>
                </>
              ) : (
                <>
                  <Link href="/publisher/auth/login" className="ios-btn" style={{
                    display: 'inline-block',
                    padding: '8px 16px', 
                    fontSize: '14px', fontWeight: 600, 
                    color: isTransparentNavbar ? '#FFFFFF' : '#1a1a1a', 
                    textDecoration: 'none',
                    transition: 'color 0.2s ease'
                  }}>
                    Masuk
                  </Link>
                  <Link href="/publisher/auth/register" className="ios-btn" style={{
                    display: 'inline-block',
                    padding: '10px 24px', 
                    background: '#2563EB', 
                    borderRadius: '999px', 
                    fontSize: '14px', fontWeight: 700, color: '#FFFFFF', textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                    transition: 'all 0.2s ease'
                  }}>
                    Daftar
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>

        {/* Footer */}
        {!isAuthPage && (
          <footer style={{ 
            position: 'relative', zIndex: 10,
            background: isLandingPage ? 'transparent' : '#FFFFFF', 
            borderTop: isLandingPage ? 'none' : '1px solid #EAEAEA', 
            padding: '40px 48px', marginTop: 'auto'
          }}>
            <div style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: '11px', color: '#999', flexWrap: 'wrap', gap: '12px'
            }}>
              <div>Copyright © Perpustakaan Digital. All rights reserved.</div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <Link href="#" className="nav-link" style={{ color: '#999', textDecoration: 'none' }}>Kebijakan Privasi</Link>
                <Link href="#" className="nav-link" style={{ color: '#999', textDecoration: 'none' }}>Syarat & Ketentuan</Link>
                <Link href="#" className="nav-link" style={{ color: '#999', textDecoration: 'none' }}>Bantuan</Link>
              </div>
            </div>
          </footer>
        )}
      </div>

    </div>
  );
}
