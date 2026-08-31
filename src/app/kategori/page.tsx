'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Users, Sparkles, Scale, Heart, GraduationCap, 
  Landmark, Lightbulb, BookOpen, Brain, Compass, 
  Atom, Palette, Film, FileText, Globe, Layers, 
  Star, ArrowUpRight, Search, BookMarked
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: string | null;
  _count?: {
    books: number;
  };
}

interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string | null;
  averageRating: number;
  totalViews?: number;
}

// Meta deskripsi & palet warna per kategori untuk tampilan modern Bento-Card
const CATEGORY_META: Record<string, { desc: string; bg: string; text: string; border: string }> = {
  'anak-anak': { desc: 'Cerita bergambar & edukasi dini', bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
  'biografi': { desc: 'Kisah hidup & inspirasi tokoh', bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
  'fiksi': { desc: 'Novel, sastra & karya imajinatif', bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  'hukum': { desc: 'Perundang-undangan & tata hukum', bg: '#F8FAFC', text: '#334155', border: '#E2E8F0' },
  'kesehatan': { desc: 'Kedokteran & gaya hidup sehat', bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA' },
  'pendidikan': { desc: 'Buku ajar, referensi & metode belajar', bg: '#FAF5FF', text: '#7E22CE', border: '#E9D5FF' },
  'politik': { desc: 'Kebijakan publik & geopolitik', bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
  'agama': { desc: 'Spiritualitas & studi keagamaan', bg: '#F0FDFA', text: '#0F766E', border: '#99F6E4' },
  'bisnis & ekonomi': { desc: 'Finansial, investasi & bisnis', bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' },
  'filsafat': { desc: 'Pemikiran kritis & etika moral', bg: '#FDF4FF', text: '#A21CAF', border: '#F5D0FE' },
  'non-fiksi': { desc: 'Fakta ilmiah, riset & dokumentasi', bg: '#F1F5F9', text: '#334155', border: '#CBD5E1' },
  'psikologi': { desc: 'Perilaku, mental & neurosains', bg: '#EEF2FF', text: '#4338CA', border: '#C7D2FE' },
  'sains & teknologi': { desc: 'Informatika, sains & teknologi', bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD' },
  'sejarah': { desc: 'Peristiwa masa lalu & arsip sejarah', bg: '#FFF7ED', text: '#9A3412', border: '#FED7AA' },
  'seni & budaya': { desc: 'Desain, musik, tradisi & estetika', bg: '#FDF2F8', text: '#BE185D', border: '#FBCFE8' },
};

export default function KategoriPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resCat, resBooks] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/books?limit=10')
      ]);
      const jsonCat = await resCat.json();
      const jsonBooks = await resBooks.json();

      if (jsonCat.success) setCategories(jsonCat.data);
      if (jsonBooks.success) setFeaturedBooks(jsonBooks.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryVector = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('anak')) return <Users size={26} />;
    if (n.includes('biografi') || n.includes('sejarah')) return <Landmark size={26} />;
    if (n.includes('fiksi') || n.includes('novel')) return <Sparkles size={26} />;
    if (n.includes('hukum')) return <Scale size={26} />;
    if (n.includes('kesehatan') || n.includes('medis')) return <Heart size={26} />;
    if (n.includes('pendidikan') || n.includes('belajar')) return <GraduationCap size={26} />;
    if (n.includes('politik')) return <Landmark size={26} />;
    if (n.includes('bisnis') || n.includes('ekonomi')) return <Lightbulb size={26} />;
    if (n.includes('filsafat')) return <Compass size={26} />;
    if (n.includes('psikologi')) return <Brain size={26} />;
    if (n.includes('sains') || n.includes('teknologi')) return <Atom size={26} />;
    if (n.includes('seni') || n.includes('budaya')) return <Palette size={26} />;
    if (n.includes('agama')) return <Globe size={26} />;
    if (n.includes('non-fiksi')) return <FileText size={26} />;
    return <BookOpen size={26} />;
  };

  const getCategoryMeta = (name: string) => {
    const key = name.toLowerCase().trim();
    if (CATEGORY_META[key]) return CATEGORY_META[key];
    for (const k in CATEGORY_META) {
      if (key.includes(k) || k.includes(key)) return CATEGORY_META[k];
    }
    return { desc: 'Koleksi literatur pilihan', bg: '#EFF6FF', text: '#2563EB', border: '#DBEAFE' };
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    return categories.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [categories, searchQuery]);

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#FAFAF8', display: 'flex', justifyContent: 'center' }}>
      
      {/* 1. GLOBAL CONTAINER PENENGAH TERKUNCI (MAX-WIDTH 1240PX & MARGIN AUTO) */}
      <main style={{ width: '100%', maxWidth: '1240px', padding: '48px 24px 96px', margin: '0 auto', boxSizing: 'border-box' }}>
        
        {/* 2. HEADER HALAMAN KATEGORI ELEGAN & SEARCH FILTER */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '36px',
          paddingBottom: '24px',
          borderBottom: '1px solid #E2E8F0'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EFF6FF', color: '#2563EB', padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
              <BookMarked size={14} /> Direktori Topik
            </div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
              Jelajahi Kategori
            </h1>
            <p style={{ fontSize: '0.938rem', color: '#64748B', margin: 0, maxWidth: '600px', lineHeight: 1.5 }}>
              Temukan ribuan karya berbobot berdasarkan bidang studi, minat baca, dan ragam genre literatur digital.
            </p>
          </div>

          {/* Quick Category Search */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Cari kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 36px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                fontSize: '0.813rem',
                color: '#0F172A',
                outline: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                transition: 'all 0.15s ease'
              }}
            />
          </div>
        </div>

        {/* 3. GRID KARTU KATEGORI BERGAYA BENTO HORIZONTAL (PROPORSI PRESISI) */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', width: '100%' }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} style={{ background: '#FFFFFF', padding: '20px', borderRadius: '18px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#E2E8F0', animation: 'pulse 1.5s infinite', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: '16px', background: '#E2E8F0', borderRadius: '4px', width: '50%', marginBottom: '8px' }} />
                  <div style={{ height: '12px', background: '#E2E8F0', borderRadius: '4px', width: '80%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px dashed #E2E8F0', padding: '64px 24px', textAlign: 'center' }}>
            <Layers size={44} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>Kategori Tidak Ditemukan</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '0 0 16px' }}>Tidak ada kategori yang cocok dengan pencarian &quot;{searchQuery}&quot;.</p>
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: '#0F172A', color: '#FFFFFF', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.813rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Reset Pencarian
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
            width: '100%'
          }}>
            {filteredCategories.map((cat) => {
              const meta = getCategoryMeta(cat.name);
              return (
                <Link 
                  href={`/?q=${encodeURIComponent(cat.name)}`} 
                  key={cat.id}
                  style={{
                    background: '#FFFFFF',
                    padding: '18px 20px',
                    borderRadius: '18px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 12px 28px -6px rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.borderColor = '#93C5FD';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  {/* Ikon Vektor Berwarna Identitas Tematik */}
                  <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '16px',
                    background: meta.bg,
                    color: meta.text,
                    border: `1px solid ${meta.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}>
                    {cat.icon ? (
                      <img 
                        src={cat.icon} 
                        alt={cat.name} 
                        style={{ width: '26px', height: '26px', objectFit: 'contain' }} 
                      />
                    ) : (
                      getCategoryVector(cat.name)
                    )}
                  </div>
                  
                  {/* Informasi Kategori */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '3px' }}>
                      <h3 style={{ 
                        fontSize: '0.938rem', 
                        fontWeight: 800, 
                        color: '#0F172A', 
                        margin: 0, 
                        letterSpacing: '-0.01em',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {cat.name}
                      </h3>
                      <span style={{
                        fontSize: '0.688rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: '#F1F5F9',
                        color: '#475569',
                        whiteSpace: 'nowrap',
                        border: '1px solid #E2E8F0'
                      }}>
                        {cat._count?.books || 0} Buku
                      </span>
                    </div>
                    
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#64748B',
                      margin: 0,
                      lineHeight: 1.35,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {meta.desc}
                    </p>
                  </div>

                  {/* Icon Panah Arah */}
                  <div style={{ color: '#CBD5E1', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <ArrowUpRight size={16} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. SECTION REKOMENDASI: BUKU PILIHAN BULAN INI          */}
        {/* ======================================================== */}
        {featuredBooks.length > 0 && (
          <section style={{ marginTop: '72px', paddingTop: '48px', borderTop: '1px solid #E2E8F0', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 4px' }}>
                  Buku Pilihan Bulan Ini
                </h2>
                <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
                  Rekomendasi bacaan terpopuler dengan rating tertinggi dari pembaca
                </p>
              </div>

              <Link href="/" style={{ fontSize: '0.813rem', fontWeight: 700, color: '#2563EB', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Lihat Beranda &rarr;
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: '40px 24px',
              width: '100%'
            }}>
              {featuredBooks.slice(0, 5).map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    textDecoration: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {/* Wrapper Gambar (Aspect Ratio 2/3 + Micro-interaction Hover Lift) */}
                  <div 
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '2/3',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
                      background: '#F1F5F9',
                      transition: 'all 0.25s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-6px)';
                      e.currentTarget.style.boxShadow = '0 16px 32px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.08)';
                    }}
                  >
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', padding: '16px' }}>
                        <BookOpen size={36} style={{ marginBottom: '6px', opacity: 0.5 }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>No Cover</span>
                      </div>
                    )}
                  </div>

                  {/* Area Teks (Di Bawah Gambar - Center Aligned) */}
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '0 4px' }}>
                    <h3 style={{
                      fontSize: '0.938rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      lineHeight: 1.35,
                      margin: '0 0 4px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textAlign: 'center',
                      width: '100%'
                    }}>
                      {book.title}
                    </h3>

                    <p style={{
                      fontSize: '0.813rem',
                      color: '#64748B',
                      margin: '0 0 6px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      width: '100%',
                      textAlign: 'center'
                    }}>
                      {book.author}
                    </p>

                    {/* Rating / Bintang (Centered) */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <Star size={14} color="#EAB308" fill="#EAB308" />
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155' }}>
                        {book.averageRating ? book.averageRating.toFixed(1) : '5.0'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>

    </div>
  );
}
