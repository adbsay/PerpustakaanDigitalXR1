'use client';

import { useState, Suspense, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import VisitorNavLink from './VisitorNavLink';
import { useSearch } from '@/context/SearchContext';

export default function GlobalVisitorNavbar() {
  const pathname = usePathname();

  // Hide navbar on admin and publisher routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/publisher')) {
    return null;
  }

  return (
    <nav className="visitor-nav" style={{ 
      background: 'white', 
      borderBottom: '1px solid #EAEAEA',
      display: 'flex', 
      alignItems: 'center', 
      padding: '16px 40px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Logo Column */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
        <Link href="/" className="visitor-nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 700, fontSize: '18px', textDecoration: 'none', color: 'inherit' }}>
          <Image src="/logo.svg" alt="Digital Library Logo" width={40} height={40} style={{ flexShrink: 0 }} />
          <span>DIGITAL LIBRARY</span>
        </Link>
      </div>

      {/* Search Column */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <NavbarSearch />
      </div>

      {/* Links Column */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '13px', fontWeight: 600 }}>
          <VisitorNavLink href="/">HOME</VisitorNavLink>
          <VisitorNavLink href="/kategori">CATEGORIES</VisitorNavLink>
          <VisitorNavLink href="/tentang-kami">ABOUT</VisitorNavLink>
          <VisitorNavLink href="/faq">FAQ</VisitorNavLink>
          <VisitorNavLink href="/kontak">CONTACT</VisitorNavLink>
        </div>
      </div>
    </nav>
  );
}

// ============================================================
// NavbarSearch — fully controlled, zero router navigation
// Writes directly to SearchContext so the page updates instantly
// without any re-mount, focus loss, or navigation flash
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
    setInputValue(value); // update UI immediately

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQuery(value.trim());
      // If user searches while on another page, bring them back to home to see results
      if (pathname !== '/' && value.trim() !== '') {
        router.push('/');
      }
    }, 200);
  };

  const handleClear = () => {
    setInputValue('');
    setQuery('');
    inputRef.current?.focus(); // keep focus after clearing
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setQuery(inputValue.trim());
    if (pathname !== '/' && inputValue.trim() !== '') {
      router.push('/');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ 
      position: 'relative', 
      display: 'flex', 
      alignItems: 'center', 
      background: '#F8F9FA', 
      border: '1px solid #EAEAEA', 
      borderRadius: '99px',
      padding: '4px 16px',
      width: '500px',
      maxWidth: '100%',
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
          padding: '8px 12px', fontSize: '14px', color: '#1a1a1a'
        }}
      />
      <button type="submit" style={{ display: 'none' }}></button>
      {inputValue && (
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
      )}
    </form>
  );
}
