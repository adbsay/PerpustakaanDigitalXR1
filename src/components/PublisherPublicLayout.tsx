'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';

export default function PublisherPublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const isLandingPage = pathname === '/publisher';
  const authType = searchParams.get('auth');
  const isAuthOpen = isLandingPage && (authType === 'login' || authType === 'register');
  
  const viewType = searchParams.get('view');
  const isViewOpen = isLandingPage && (viewType === 'tentang-kami' || viewType === 'faq' || viewType === 'kontak');

  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // If we are on the landing page, check if already logged in.
    // If yes, do a full-page redirect immediately so we never show the split-screen.
    if (isLandingPage) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('publisher_token') : null;
      if (token) {
        fetch('/api/publisher/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(r => r.json())
          .then(j => {
            if (j.success) {
              // Valid session — go straight to dashboard (full page navigation)
              router.replace('/publisher/dashboard');
            } else {
              // Token invalid/expired — remove it and show landing normally
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

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data === 'AUTH_SUCCESS') {
        setIsRedirecting(true);
        // Wait for panel close animation, then redirect
        setTimeout(() => {
          router.push('/publisher/dashboard');
        }, 800);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [router]);

  // While checking auth on landing page, show a blank/loading state to avoid flash
  if (isLandingPage && isCheckingAuth) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.2)', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', fontFamily: 'var(--font-inter, sans-serif)', color: '#1a1a1a', background: '#FFFFFF', height: '100vh', width: '100%', display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
      {/* Loading overlay when redirecting to dashboard */}
      {isRedirecting && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'overlayFadeIn 0.3s ease forwards'
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
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          opacity: 0; /* starts hidden */
        }

        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }

        .ios-btn {
          transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.3s ease, border-color 0.3s ease;
        }
        
        .ios-btn:hover {
          transform: scale(1.05);
        }
        
        .ios-btn:active {
          transform: scale(0.95);
        }

        .nav-link {
          display: inline-block;
          transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease;
        }

        .nav-link:hover {
          transform: scale(1.08);
          opacity: 0.8;
        }

        .nav-link:active {
          transform: scale(0.95);
          opacity: 0.6;
        }

        .main-container {
           flex: 1; 
           display: flex; 
           flex-direction: column; 
           transition: all 0.6s cubic-bezier(0.25, 1, 0.5, 1);
           position: relative;
           overflow-y: auto;
           overflow-x: hidden;
           height: 100vh;
           z-index: 0;
           background: transparent;
        }
        .main-container.shrink {
           margin-right: 450px;
           border-radius: 0 24px 24px 0;
           transform: scale(0.98);
           box-shadow: 0 0 40px rgba(0,0,0,0.3);
           overflow: hidden;
        }
        
        .side-panel {
            width: 450px;
            background: #FFFFFF;
            position: absolute;
            right: 0;
            top: 0;
            bottom: 0;
            transform: translateX(100%);
            transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
            z-index: 100;
            box-shadow: -10px 0 30px rgba(0,0,0,0.1);
        }
        .side-panel.open {
            transform: translateX(0);
        }

        .top-panel {
            position: absolute;
            top: 80px; /* Below navbar */
            left: 0;
            right: 0;
            bottom: 0;
            background: transparent;
            transform: translateY(-100%);
            transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
            z-index: 5;
            pointer-events: none;
        }
        .top-panel.open {
            transform: translateY(0);
            pointer-events: auto;
        }
      `}</style>
      
      {/* Main Content Area */}
      <div className={`main-container ${isAuthOpen ? 'shrink' : ''}`}>
        {isLandingPage && (
          <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
            <Image
              src="/background.png"
              alt="Background"
              fill
              style={{ objectFit: 'cover' }}
              quality={100}
              priority
            />
          </div>
        )}

        {/* Navbar */}
        <nav className="animate-fade-in-up" style={{ 
          position: 'relative', zIndex: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          padding: '20px 48px', 
          background: isLandingPage ? 'rgba(0, 0, 0, 0.2)' : '#FFFFFF', 
          backdropFilter: isLandingPage ? 'blur(10px)' : 'none',
          WebkitBackdropFilter: isLandingPage ? 'blur(10px)' : 'none',
          borderBottom: isLandingPage ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #EAEAEA',
          color: isLandingPage ? '#FFFFFF' : '#1a1a1a'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/publisher" className="ios-btn" style={{ display: 'flex' }}>
              <img src="/logo.svg" alt="Digital Library Logo" style={{ width: '40px', height: '40px' }} />
            </Link>
            <Link href="/publisher" className="nav-link" style={{ fontWeight: 700, fontSize: '14px', lineHeight: 1.2, color: 'inherit', textDecoration: 'none' }}>
              PERPUSTAKAAN<br/>DIGITAL
            </Link>
          </div>
          
          <div style={{ display: 'flex', gap: '32px', fontSize: '13px', fontWeight: 600 }}>
            <Link href="/publisher" className="nav-link" style={{ color: 'inherit', textDecoration: 'none' }}>BERANDA</Link>
            <Link href="?view=tentang-kami" className="nav-link" style={{ color: 'inherit', textDecoration: 'none' }}>TENTANG KAMI</Link>
            <Link href="?view=faq" className="nav-link" style={{ color: 'inherit', textDecoration: 'none' }}>FAQ</Link>
            <Link href="?view=kontak" className="nav-link" style={{ color: 'inherit', textDecoration: 'none' }}>KONTAK</Link>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="?auth=login" className="ios-btn" style={{
              display: 'inline-block',
              padding: '10px 24px', 
              border: isLandingPage ? '1px solid rgba(255, 255, 255, 0.5)' : '1px solid #EAEAEA', 
              borderRadius: '6px', 
              fontSize: '13px', fontWeight: 600, color: 'inherit', textDecoration: 'none',
              background: isLandingPage ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
            }}>
              MASUK
            </Link>
            <Link href="?auth=register" className="ios-btn" style={{
              display: 'inline-block',
              padding: '10px 24px', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '6px', 
              fontSize: '13px', fontWeight: 600, color: '#FFFFFF', textDecoration: 'none',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)'
            }}>
              DAFTAR
            </Link>
          </div>
        </nav>

        {/* Top Overlay Panel for Views */}
        <div className={`top-panel ${isViewOpen ? 'open' : ''}`}>
          {isViewOpen && (
            <iframe 
              src={`/publisher/${viewType}?embedded=true`} 
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          )}
        </div>

        {/* Main Content */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>

        {/* Footer */}
        <footer style={{ 
          position: 'relative', zIndex: 10,
          background: isLandingPage ? 'transparent' : '#FFFFFF', 
          borderTop: isLandingPage ? 'none' : '1px solid #EAEAEA', 
          padding: '40px 48px', marginTop: 'auto'
        }}>

          <div style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: '11px', color: '#999'
          }}>
            <div>Copyright © Perpustakaan Digital. All rights reserved.</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link href="#" className="nav-link" style={{ color: '#999', textDecoration: 'none' }}>Legal</Link>
              <Link href="#" className="nav-link" style={{ color: '#999', textDecoration: 'none' }}>Pages</Link>
              <Link href="#" className="nav-link" style={{ color: '#999', textDecoration: 'none' }}>Legal pages</Link>
            </div>
          </div>
        </footer>
      </div>

      {/* Right Side Panel for Auth */}
      <div className={`side-panel ${isAuthOpen ? 'open' : ''}`}>
        {isAuthOpen && (
          <>
            <div style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'flex-end' }}>
               <Link href="/publisher" style={{ padding: '8px', cursor: 'pointer', fontSize: '20px', textDecoration: 'none', color: '#333' }}>
                 ✕
               </Link>
            </div>
            <iframe 
              src={`/publisher/auth/${authType}?embedded=true`} 
              style={{ width: '100%', height: 'calc(100% - 60px)', border: 'none' }}
            />
          </>
        )}
      </div>
    </div>
  );
}
