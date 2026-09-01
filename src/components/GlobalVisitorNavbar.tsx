'use client';

import { useState, Suspense, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import VisitorNavLink from './VisitorNavLink';
import { useSearch } from '@/context/SearchContext';

export default function GlobalVisitorNavbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Update browser favicon to logo.svg on visitor pages
  useEffect(() => {
    if (typeof window !== 'undefined' && !pathname.startsWith('/admin') && !pathname.startsWith('/publisher')) {
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'shortcut icon';
        document.head.appendChild(link);
      }
      link.type = 'image/svg+xml';
      link.href = '/logo.svg';
    }
  }, [pathname]);

  // Tutup menu mobile jika route/halaman berubah
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Kunci scroll body saat menu mobile terbuka
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  // Hide navbar on admin and publisher routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/publisher')) {
    return null;
  }

  return (
    <>
      {/* 
        =======================================================
        CSS KHUSUS UNTUK MEMBUNUH FIXED HEIGHT & MEMPERBAIKI LAYOUT
        MEMAKSA 1 BARIS LURUS (INLINE) DI MOBILE
        =======================================================
      */}
      <style>{`
        /* Desktop Default Styles - MEMBUNUH FIXED HEIGHT GLOBAL */
        .visitor-nav {
          height: auto !important;
          min-height: max-content !important;
          overflow: visible !important;
        }
        .navbar-container {
          max-width: 1240px; margin: 0 auto; padding: 12px 24px;
          display: flex; align-items: center; justify-content: space-between; gap: 36px; width: 100%;
          height: auto !important;
          overflow: visible !important;
        }
        .logo-col { display: flex; align-items: center; flex-shrink: 0; }
        .search-col { flex: 1; display: flex; justify-content: center; max-width: 380px; margin: 0 32px; }
        .links-col { display: flex; align-items: center; flex-shrink: 0; }
        .mobile-menu-btn { display: none; }
        
        .mobile-menu-overlay { 
          position: fixed; top: 0; left: 0; width: 100%; height: 100vh; 
          background: #FFFFFF; z-index: 9999; 
          transform: translateY(-100%); opacity: 0; transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1); 
          visibility: hidden;
        }
        .mobile-menu-overlay.open { 
          transform: translateY(0); opacity: 1; visibility: visible; 
        }

        /* Mobile View Styles (Max Width 768px) */
        @media (max-width: 768px) {
          .visitor-nav {
            height: auto !important;
          }
          .navbar-container { 
            flex-wrap: nowrap !important; /* FIX MUTLAK: Paksa 1 baris, tidak boleh turun ke bawah */
            padding: max(16px, env(safe-area-inset-top)) 12px 12px !important; 
            gap: 10px !important; /* Jarak antar elemen dipersempit */
            align-items: center !important;
          }
          .logo-col { 
            flex: 0 0 auto !important; /* Logo jangan melebar */
          }
          .visitor-nav-logo {
            gap: 6px !important; /* FIX: Jarak sempit di samping icon */
          }
          .visitor-nav-logo img {
            width: 28px !important; /* Ikon dikecilkan sedikit di HP */
            height: 28px !important;
          }
          
          /* FIX: Teks Desktop disembunyikan, Teks Mobile ditumpuk atas bawah */
          .desktop-logo-text { display: none !important; }
          .mobile-logo-text { 
            display: flex !important; 
            flex-direction: column !important; 
            line-height: 1.1 !important; 
            font-size: 11px !important; 
            font-weight: 900 !important;
          }

          .search-col { 
            max-width: none !important; 
            margin: 0 !important; 
            order: unset !important; /* Kembali ke urutan normal (di tengah) */
            width: auto !important; 
            flex: 1 !important; /* Ambil semua sisa ruang kosong di tengah */
          }
          .nav-search-form { 
            max-width: 100% !important; 
            width: 100% !important; 
            padding: 4px 10px !important; /* Padding form dikecilkan */
          }
          .nav-search-form input {
            font-size: 13px !important;
            padding: 6px 8px !important;
          }
          .search-shortcut-hint {
            display: none !important; /* Sembunyikan "Ctrl K" di HP biar input lebih lega */
          }

          .links-col { display: none !important; }
          .mobile-menu-btn { 
            display: flex !important; align-items: center; justify-content: center; 
            background: none; border: none; cursor: pointer; padding: 4px; color: #0F172A;
            order: unset !important;
            flex: 0 0 auto !important;
          }
        }
      `}</style>

      <nav className="visitor-nav" style={{ 
        background: 'white', 
        borderBottom: '1px solid #EAEAEA',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        height: 'auto'
      }}>
        <div className="navbar-container">
          
          {/* Logo Column */}
          <div className="logo-col">
            <Link href="/" className="visitor-nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800, fontSize: '17px', textDecoration: 'none', color: '#0F172A', letterSpacing: '-0.02em' }}>
              <img src="/logo-navbar.svg" alt="Digital Library Logo" width="34" height="34" style={{ flexShrink: 0 }} />
              {/* Teks Desktop (Utuh) */}
              <span className="desktop-logo-text">DIGITAL LIBRARY</span>
              {/* Teks Mobile (Ditumpuk - Hanya muncul di HP) */}
              <span className="mobile-logo-text" style={{ display: 'none' }}>
                <span>DIGITAL</span>
                <span>LIBRARY</span>
              </span>
            </Link>
          </div>

          {/* Search Column */}
          <div className="search-col">
            <NavbarSearch />
          </div>

          {/* Tombol Hamburger (Khusus Mobile) */}
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          {/* Links Column (Khusus Desktop) */}
          <div className="links-col">
            <div style={{ display: 'flex', gap: '22px', alignItems: 'center', fontSize: '14px', fontWeight: 600 }}>
              <VisitorNavLink href="/">Beranda</VisitorNavLink>
              <VisitorNavLink href="/kategori">Kategori</VisitorNavLink>
              <VisitorNavLink href="/tentang-kami">Tentang</VisitorNavLink>
              <VisitorNavLink href="/faq">FAQ</VisitorNavLink>
              <VisitorNavLink href="/kontak">Kontak</VisitorNavLink>

              <Link href="/publisher" style={{
                padding: '7px 18px',
                borderRadius: '999px',
                border: '1px solid #CBD5E1',
                color: '#334155',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 700,
                transition: 'all 0.2s ease',
                marginLeft: '10px',
                whiteSpace: 'nowrap',
                background: '#FFFFFF'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0F172A';
                e.currentTarget.style.color = '#0F172A';
                e.currentTarget.style.background = '#F8FAFC';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#CBD5E1';
                e.currentTarget.style.color = '#334155';
                e.currentTarget.style.background = '#FFFFFF';
              }}
              >
                Ruang Penerbit
              </Link>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MOBILE SLIDE MENU OVERLAY (Khusus HP saat tombol di-klik)*/}
        {/* ======================================================== */}
        <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #EAEAEA' }}>
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800, fontSize: '17px', textDecoration: 'none', color: '#0F172A' }}>
              <Image src="/logo.svg" alt="Digital Library Logo" width={30} height={30} />
              <span>DIGITAL LIBRARY</span>
            </Link>
            <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#0F172A' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '24px 20px', gap: '20px', fontSize: '1.05rem', fontWeight: 600 }}>
            {/* Dibungkus div untuk menjamin tertutup walau menggunakan custom VisitorNavLink */}
            <div onClick={() => setIsMobileMenuOpen(false)}><VisitorNavLink href="/">Beranda</VisitorNavLink></div>
            <div onClick={() => setIsMobileMenuOpen(false)}><VisitorNavLink href="/kategori">Kategori</VisitorNavLink></div>
            <div onClick={() => setIsMobileMenuOpen(false)}><VisitorNavLink href="/tentang-kami">Tentang</VisitorNavLink></div>
            <div onClick={() => setIsMobileMenuOpen(false)}><VisitorNavLink href="/faq">FAQ</VisitorNavLink></div>
            <div onClick={() => setIsMobileMenuOpen(false)}><VisitorNavLink href="/kontak">Kontak</VisitorNavLink></div>
            
            <div style={{ height: '1px', background: '#EAEAEA', margin: '8px 0' }} />
            
            <Link href="/publisher" onClick={() => setIsMobileMenuOpen(false)} style={{
              padding: '14px',
              borderRadius: '12px',
              background: '#0F172A',
              color: '#FFFFFF',
              textDecoration: 'none',
              textAlign: 'center',
              fontSize: '0.938rem',
              fontWeight: 700,
              marginTop: '4px',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)'
            }}>
              Masuk Ruang Penerbit
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}

// ============================================================
// NavbarSearch
// ============================================================
function NavbarSearch() {
  const { query, setQuery } = useSearch();
  const [inputValue, setInputValue] = useState(query);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // If query is cleared externally (e.g. X button on page), sync input
  useEffect(() => {
    if (query === '' && inputValue !== '') {
      setInputValue('');
    }
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value); 

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQuery(value.trim());
      if (pathname !== '/' && value.trim() !== '') {
        router.push('/');
      }
    }, 200);
  };

  const handleClear = () => {
    setInputValue('');
    setQuery('');
    inputRef.current?.focus(); 
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setQuery(inputValue.trim());
    if (pathname !== '/' && inputValue.trim() !== '') {
      router.push('/');
    }
  };

  return (
    <form className="nav-search-form" onSubmit={handleSubmit} style={{ 
      position: 'relative', 
      display: 'flex', 
      alignItems: 'center', 
      background: '#F8F9FA', 
      border: '1px solid #EAEAEA', 
      borderRadius: '99px',
      padding: '4px 16px',
      width: '100%',
      maxWidth: '448px',
      transition: 'border-color 0.2s ease'
    }}>
      <Image src="/search.svg" alt="Search Icon" width={16} height={16} style={{ opacity: 0.6, flexShrink: 0 }} />
      <input
        ref={inputRef}
        name="q"
        type="text"
        placeholder="Cari Buku, Penulis, Penerbit..."
        value={inputValue}
        onChange={handleInputChange}
        autoComplete="off"
        style={{ 
          flex: 1, background: 'transparent', border: 'none', outline: 'none', 
          padding: '8px 12px', fontSize: '14px', color: '#1a1a1a', width: '100%'
        }}
      />
      <button type="submit" style={{ display: 'none' }}></button>
      {inputValue ? (
        <div 
          onMouseDown={(e) => e.preventDefault()} // prevent blur before click
          onClick={handleClear}
          style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '24px', height: '24px', borderRadius: '50%',
            background: '#E8E8E8', color: '#555', cursor: 'pointer',
            fontSize: '11px', fontWeight: 'bold', flexShrink: 0,
            transition: 'background 0.15s'
          }}
          title="Hapus Pencarian"
        >
          ✕
        </div>
      ) : (
        <div className="search-shortcut-hint" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '4px 6px', borderRadius: '4px', border: '1px solid #EAEAEA',
          background: '#FFFFFF', color: '#9CA3AF',
          fontSize: '10px', fontWeight: 600, flexShrink: 0,
          marginLeft: '4px', fontFamily: 'inherit'
        }}>
          Ctrl K
        </div>
      )}
    </form>
  );
}