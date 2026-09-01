'use client';

import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearch } from '@/context/SearchContext';
import { useRouter } from 'next/navigation';
import { 
  Star, BookOpen, Sparkles, GraduationCap, Heart, 
  Scale, Landmark, Lightbulb, Folder, Users, 
  ChevronLeft, ChevronRight, ArrowRight, ChevronDown,
  RotateCcw, Layers, Clock, Eye, SlidersHorizontal,
  Compass, ArrowUpRight
} from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  categoryId?: string;
  categoryName?: string;
  coverImage: string | null;
  publisherName: string | null;
  averageRating: number;
  totalViews: number;
  createdAt?: string;
}

interface Publisher {
  id: string;
  name: string;
  avatar?: string | null;
  _count?: { books: number };
}

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

const ITEMS_PER_PAGE = 10;

const PROMO_SLIDES = [
  {
    badge: '✨ Rekomendasi Minggu Ini',
    title: 'Jelajahi Ribuan Buku Tanpa Batas',
    desc: 'Temukan literatur akademik dan novel populer langsung dari penerbit terpercaya dalam satu genggaman.',
    ctaText: 'Mulai Membaca',
    ctaLink: '#books-section',
    gradient: 'from-slate-950 via-blue-950 to-slate-900',
    accent: '#3B82F6'
  },
  {
    badge: '🚀 Ruang Penerbit Digital',
    title: 'Publikasikan Karya & Jangkau Pembaca',
    desc: 'Bagi penerbit dan penulis, digitalisasikan katalog ebook Anda dengan analitik performa pembaca real-time.',
    ctaText: 'Gabung Penerbit',
    ctaLink: '/publisher',
    gradient: 'from-slate-950 via-indigo-950 to-slate-900',
    accent: '#6366F1'
  },
  {
    badge: '📚 Akses Terbuka & Gratis',
    title: 'Perpustakaan Masa Depan Indonesia',
    desc: 'Nikmati kurasi koleksi buku berkualitas dari berbagai disiplin ilmu, sains, sastra, hingga filsafat.',
    ctaText: 'Lihat Kategori',
    ctaLink: '/kategori',
    gradient: 'from-slate-950 via-slate-900 to-blue-950',
    accent: '#0EA5E9'
  }
];

export default function HomePage() {
  return (
    <Suspense fallback={<div style={{ width: '100%', maxWidth: '1240px', margin: '0 auto', padding: '40px 24px' }} />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Search state (when query exists)
  const [searchCategories, setSearchCategories] = useState<Category[]>([]);
  const [searchPublishers, setSearchPublishers] = useState<Publisher[]>([]);
  const [searchAuthors, setSearchAuthors] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);

  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  // 4 Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedTimeSort, setSelectedTimeSort] = useState<string>('NEWEST');
  const [selectedMetricFilter, setSelectedMetricFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Listen to search context
  const { query: q, setQuery } = useSearch();
  const router = useRouter();

  const abortRef = useRef<AbortController | null>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const categoryItemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const booksSectionRef = useRef<HTMLDivElement>(null);

  // Auto-play promo slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % PROMO_SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    if (q) {
      fetchSearchResults(q, signal);
    } else {
      fetchBooks(signal);
      fetchCategories();
    }
  }, [q]);

  // Otomatis geser/scroll daftar kategori horizontal saat kategori dipilih
  const scrollToCategoryItem = (catName: string) => {
    if (!categoryScrollRef.current) return;
    if (catName === 'ALL') {
      categoryScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }
    const el = categoryItemRefs.current[catName];
    if (el) {
      const container = categoryScrollRef.current;
      const scrollTarget = el.offsetLeft - (container.offsetWidth / 2) + (el.offsetWidth / 2);
      container.scrollTo({ left: Math.max(0, scrollTarget), behavior: 'smooth' });
    }
  };

  const fetchBooks = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const res = await fetch('/api/books?limit=100', { signal });
      const json = await res.json();
      if (json.success) setBooks(json.data);
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchResults = async (query: string, signal?: AbortSignal) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal });
      const json = await res.json();
      if (json.success) {
        setBooks(json.data.books);
        setSearchCategories(json.data.categories);
        setSearchPublishers(json.data.publishers);
        setSearchAuthors(json.data.authors);
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const json = await res.json();
      if (json.success) setCategories(json.data);
    } catch {}
  };

  const scrollCategoriesManual = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCategorySelect = (catName: string) => {
    setSelectedCategory(catName);
    setCurrentPage(1);
    scrollToCategoryItem(catName);
  };

  const resetAllFilters = () => {
    setSelectedCategory('ALL');
    setSelectedTimeSort('NEWEST');
    setSelectedMetricFilter('ALL');
    setCurrentPage(1);
    if (q) setQuery('');
    scrollToCategoryItem('ALL');
  };

  const isFilterActive = selectedCategory !== 'ALL' || selectedTimeSort !== 'NEWEST' || selectedMetricFilter !== 'ALL' || Boolean(q);

  // Filter and Sort Pipeline
  const filteredAndSortedBooks = useMemo(() => {
    let result = [...books];

    // 1. Filter Kategori
    if (selectedCategory !== 'ALL') {
      result = result.filter(b => b.categoryName === selectedCategory || b.categoryId === selectedCategory);
    }

    // 2. Filter Rating
    if (selectedMetricFilter === 'RATING_HIGH') {
      result = result.filter(b => (b.averageRating || 0) >= 4.0);
    } else if (selectedMetricFilter === 'RATING_LOW') {
      result = result.filter(b => (b.averageRating || 0) < 4.0);
    }

    // 3. Sorting (Waktu / Views / Rating)
    if (selectedMetricFilter === 'VIEWS_HIGH') {
      result.sort((a, b) => (b.totalViews || 0) - (a.totalViews || 0));
    } else if (selectedMetricFilter === 'VIEWS_LOW') {
      result.sort((a, b) => (a.totalViews || 0) - (b.totalViews || 0));
    } else if (selectedMetricFilter === 'RATING_HIGH') {
      result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (selectedMetricFilter === 'RATING_LOW') {
      result.sort((a, b) => (a.averageRating || 0) - (b.averageRating || 0));
    } else {
      if (selectedTimeSort === 'NEWEST') {
        result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      } else if (selectedTimeSort === 'OLDEST') {
        result.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
      }
    }

    return result;
  }, [books, selectedCategory, selectedTimeSort, selectedMetricFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAndSortedBooks.length / ITEMS_PER_PAGE) || 1;
  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedBooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedBooks, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      if (booksSectionRef.current) {
        booksSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('anak')) return <Users size={22} />;
    if (n.includes('fiksi') || n.includes('novel')) return <Sparkles size={22} />;
    if (n.includes('hukum')) return <Scale size={22} />;
    if (n.includes('kesehatan') || n.includes('medis')) return <Heart size={22} />;
    if (n.includes('pendidikan') || n.includes('belajar')) return <GraduationCap size={22} />;
    if (n.includes('politik')) return <Landmark size={22} />;
    if (n.includes('bisnis') || n.includes('ekonomi')) return <Lightbulb size={22} />;
    return <BookOpen size={22} />;
  };

  const slide = PROMO_SLIDES[currentSlide];

  return (
    <>
      {/* 
        =======================================================
        CSS KHUSUS MOBILE UNTUK LAYOUT VERTIKAL & HEMAT RUANG 
        =======================================================
      */}
      <style>{`
        @media (max-width: 768px) {
          /* Container Utama */
          .home-global-container { padding: 12px 16px 80px !important; }

          /* HERO BANNER COMPRESSION - EXTREME 16:9 VIBE UNTUK HP */
          .hero-banner-container {
            flex-direction: row !important; /* PAKSA BERSAMPINGAN AGAR GEPENG */
            padding: 16px 16px 28px 16px !important; 
            height: 200px !important; /* Paksa tinggi pendek ala 16:9 */
            min-height: 200px !important;
            border-radius: 16px !important;
            align-items: center !important;
            overflow: hidden !important;
          }
          .hero-text-section {
            flex: 1 1 65% !important;
            width: 65% !important;
            padding-right: 0 !important;
            align-items: flex-start !important; /* Rata kiri */
            text-align: left !important;
            margin-bottom: 0 !important;
            z-index: 20 !important;
          }
          .hero-badge-mobile {
            font-size: 0.5rem !important;
            padding: 4px 8px !important;
            margin-bottom: 6px !important;
          }
          .hero-title { 
            font-size: 1.05rem !important; 
            margin-bottom: 4px !important; 
            line-height: 1.2 !important;
          }
          .hero-desc { 
            font-size: 0.65rem !important; 
            margin-bottom: 10px !important; 
            line-height: 1.3 !important;
            display: -webkit-box;
            -webkit-line-clamp: 2; /* Potong teks max 2 baris */
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .hero-cta-btn {
            padding: 6px 12px !important;
            font-size: 0.65rem !important;
            border-radius: 8px !important;
          }
          
          /* Hero 3D Book Section - Disembunyikan sebagian di Kanan */
          .hero-visual-section {
            position: absolute !important;
            right: -80px !important; /* Geser ke luar kanan sedikit */
            top: 50% !important;
            transform: translateY(-50%) scale(0.35) !important; /* Ukuran sangat kecil */
            z-index: 10 !important;
            width: auto !important;
            min-height: auto !important;
            flex: none !important;
          }
          .animate-hero-float {
            transform: none !important;
            margin-top: 0 !important; 
          }
          .animate-hero-floor-shadow {
            bottom: 0px !important;
            width: 160px !important;
          }
          
          /* Hero Nav Dock (Netflix style slider dots) - Di tengah bawah */
          .hero-nav-dock {
            bottom: 6px !important;
            right: 50% !important;
            transform: translateX(50%) scale(0.7) !important;
            padding: 2px 6px !important;
            width: max-content !important;
          }
          .hero-nav-dock button svg { width: 14px !important; height: 14px !important; }

          /* KATEGORI SCROLL */
          .category-header { margin-bottom: 10px !important; }
          .category-title { font-size: 1.15rem !important; }
          .category-card-mobile {
            width: 110px !important;
            padding: 12px 8px !important;
          }
          .category-icon-mobile {
            width: 32px !important;
            height: 32px !important;
          }
          .category-icon-mobile svg {
            width: 16px !important;
            height: 16px !important;
          }
          .category-text-mobile {
            font-size: 0.75rem !important;
          }

          /* FILTER COMPRESSION (MEMAKSA BERJAJAR KESAMPING HORIZONTAL) */
          .filter-header-section {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
            margin-bottom: 16px !important;
            padding-bottom: 12px !important;
          }
          .filter-controls-wrapper {
            display: flex !important;
            flex-direction: row !important; /* KUNCI: Berjajar ke Samping */
            flex-wrap: nowrap !important;
            width: 100% !important;
            gap: 8px !important;
            overflow-x: auto !important; /* KUNCI: Bisa digeser/scroll */
            padding-bottom: 4px !important;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .filter-controls-wrapper::-webkit-scrollbar { display: none; }
          
          .filter-item { 
            width: 140px !important; /* Fixed width agar tidak menciut */
            flex: 0 0 auto !important; 
            display: flex !important; 
          }
          .filter-item select {
            width: 100% !important;
            font-size: 0.75rem !important;
            padding: 8px 24px 8px 28px !important;
            border-radius: 8px !important;
          }
          .filter-item-icon { left: 8px !important; }
          .filter-item-icon svg { width: 12px !important; height: 12px !important; }
          .filter-reset-btn {
            width: auto !important;
            flex: 0 0 auto !important;
            justify-content: center !important;
            padding: 8px 12px !important;
            border-radius: 8px !important;
            margin-top: 0 !important;
          }

          /* BOOK GRID (Memaksa jadi 2 Kolom di Mobile) */
          .books-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px 12px !important;
          }
          .book-card-title { font-size: 0.813rem !important; }
          .book-card-author { font-size: 0.7rem !important; }
        }
      `}</style>

      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', background: '#FAFAF8', minHeight: '100vh' }}>
        
        {/* 1. GLOBAL CONTAINER PENENGAH TERKUNCI (MAX-WIDTH 1240PX & MARGIN AUTO) */}
        <div className="home-global-container" style={{ width: '100%', maxWidth: '1240px', padding: '24px 24px 80px', margin: '0 auto', boxSizing: 'border-box' }}>

          {/* ======================================================== */}
          {/* HERO PROMO BANNER (WORLD-CLASS APPLE BOOKS / NETFLIX UI) */}
          {/* ======================================================== */}
          {!q && (
            <div style={{ width: '100%', marginBottom: '32px', marginTop: '4px' }}>
              <div 
                className="hero-banner-container"
                style={{
                  position: 'relative',
                  width: '100%',
                  minHeight: '350px',
                  borderRadius: '28px',
                  overflow: 'hidden',
                  backgroundImage: 'url(/hero-library-bg.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 20px 50px -15px rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '40px 52px',
                  boxSizing: 'border-box'
                }}
              >
                
                {/* 1. DOUBLE OVERLAY (SLATE 950/80 + RADIAL VIGNETTE EDGE) */}
                <div 
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(2, 6, 23, 0.78)',
                    backdropFilter: 'blur(2px)',
                    pointerEvents: 'none',
                    zIndex: 1
                  }} 
                />
                <div 
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at 65% 50%, rgba(15, 23, 42, 0.35) 0%, rgba(2, 6, 23, 0.92) 85%)',
                    pointerEvents: 'none',
                    zIndex: 2
                  }} 
                />

                {/* SISI KIRI (Teks & Tombol CTA) */}
                <div className="hero-text-section" style={{
                  flex: '1 1 55%',
                  zIndex: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  paddingRight: '24px'
                }}>
                  
                  {/* Badge Tag */}
                  <div className="hero-badge-mobile" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(96, 165, 250, 0.4)',
                    color: '#93C5FD',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    marginBottom: '16px',
                    backdropFilter: 'blur(8px)'
                  }}>
                    {slide.badge}
                  </div>

                  {/* Judul Spanduk */}
                  <h1 className="hero-title" style={{
                    fontSize: '2.2rem',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    lineHeight: 1.2,
                    letterSpacing: '-0.03em',
                    margin: '0 0 12px 0',
                    maxWidth: '520px',
                    textShadow: '0 2px 12px rgba(0,0,0,0.5)'
                  }}>
                    {slide.title}
                  </h1>

                  {/* Deskripsi Singkat */}
                  <p className="hero-desc" style={{
                    fontSize: '0.938rem',
                    color: '#CBD5E1',
                    lineHeight: 1.6,
                    margin: '0 0 24px 0',
                    maxWidth: '460px',
                    textShadow: '0 1px 4px rgba(0,0,0,0.5)'
                  }}>
                    {slide.desc}
                  </p>

                  {/* Tombol Aksi (CTA) */}
                  {slide.ctaLink.startsWith('#') ? (
                    <button
                      className="hero-cta-btn"
                      onClick={() => {
                        booksSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      style={{
                        background: '#2563EB',
                        color: '#FFFFFF',
                        fontSize: '0.875rem',
                        fontWeight: 800,
                        padding: '12px 28px',
                        borderRadius: '14px',
                        border: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 8px 22px rgba(37, 99, 235, 0.45)',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#1D4ED8';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 12px 28px rgba(37, 99, 235, 0.55)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#2563EB';
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 8px 22px rgba(37, 99, 235, 0.45)';
                      }}
                    >
                      {slide.ctaText} <ArrowRight size={16} />
                    </button>
                  ) : (
                    <Link
                      href={slide.ctaLink}
                      className="hero-cta-btn"
                      style={{
                        background: '#2563EB',
                        color: '#FFFFFF',
                        fontSize: '0.875rem',
                        fontWeight: 800,
                        padding: '12px 28px',
                        borderRadius: '14px',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 8px 22px rgba(37, 99, 235, 0.45)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#1D4ED8';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 12px 28px rgba(37, 99, 235, 0.55)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#2563EB';
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 8px 22px rgba(37, 99, 235, 0.45)';
                      }}
                    >
                      {slide.ctaText} <ArrowRight size={16} />
                    </Link>
                  )}

                </div>

                {/* SISI KANAN (Visual Mockup 3D Fan-Out 3 Buku + Efek Bayangan Lantai Kuat + Animasi Float) */}
                <div className="hero-visual-section" style={{
                  flex: '1 1 45%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                  zIndex: 10,
                  minHeight: '300px'
                }}>
                  
                  {/* 2. EFEK BAYANGAN LANTAI KUAT & REALISTIS (FLOOR SHADOW) */}
                  <div 
                    className="animate-hero-floor-shadow"
                    style={{
                      position: 'absolute',
                      bottom: '-12px',
                      width: '270px',
                      height: '24px',
                      background: 'radial-gradient(ellipse, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.5) 45%, transparent 75%)',
                      filter: 'blur(7px)',
                      borderRadius: '50%',
                      zIndex: 5
                    }} 
                  />

                  {/* Kontainer Animasi Floating Halus 3D */}
                  <div 
                    className="animate-hero-float"
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10
                    }}
                  >

                    {/* 1. BUKU KIRI BELAKANG (LAYER 1 - Real Book Cover) */}
                    <div 
                      style={{
                        position: 'absolute',
                        width: '165px',
                        height: '235px',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        background: '#0F172A',
                        border: '1.5px solid rgba(255,255,255,0.15)',
                        transform: 'rotate(-15deg) translateX(-60px) translateY(8px) scale(0.88)',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7), -15px 20px 35px rgba(0, 0, 0, 0.8)',
                        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                        zIndex: 11,
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'rotate(-18deg) translateX(-72px) translateY(2px) scale(0.92)';
                        e.currentTarget.style.zIndex = '25';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'rotate(-15deg) translateX(-60px) translateY(8px) scale(0.88)';
                        e.currentTarget.style.zIndex = '11';
                      }}
                    >
                      {books.length > 1 && (books[(currentSlide + 1) % books.length]?.coverImage || books[1]?.coverImage) ? (
                        <img 
                          src={books[(currentSlide + 1) % books.length]?.coverImage || books[1]?.coverImage || ''} 
                          alt="Left Background Book" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1E1B4B, #0F172A)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
                          <BookOpen size={28} color="#818CF8" />
                        </div>
                      )}
                      {/* Spine Highlight */}
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 10%, rgba(0,0,0,0.2) 100%)', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.18)', pointerEvents: 'none' }} />
                    </div>

                    {/* 2. BUKU KANAN BELAKANG (LAYER 2 - Real Book Cover) */}
                    <div 
                      style={{
                        position: 'absolute',
                        width: '165px',
                        height: '235px',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        background: '#0F172A',
                        border: '1.5px solid rgba(255,255,255,0.15)',
                        transform: 'rotate(15deg) translateX(60px) translateY(10px) scale(0.88)',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7), 15px 20px 35px rgba(0, 0, 0, 0.8)',
                        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                        zIndex: 12,
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'rotate(18deg) translateX(72px) translateY(4px) scale(0.92)';
                        e.currentTarget.style.zIndex = '25';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'rotate(15deg) translateX(60px) translateY(10px) scale(0.88)';
                        e.currentTarget.style.zIndex = '12';
                      }}
                    >
                      {books.length > 2 && (books[(currentSlide + 2) % books.length]?.coverImage || books[2]?.coverImage) ? (
                        <img 
                          src={books[(currentSlide + 2) % books.length]?.coverImage || books[2]?.coverImage || ''} 
                          alt="Right Background Book" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #064E3B, #0F172A)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
                          <BookOpen size={28} color="#34D399" />
                        </div>
                      )}
                      {/* Spine Highlight */}
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 10%, rgba(0,0,0,0.2) 100%)', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.18)', pointerEvents: 'none' }} />
                    </div>

                    {/* 3. BUKU UTAMA TENGAH DEPAN (LAYER 3 - Hero Main Book) */}
                    <div 
                      style={{
                        position: 'relative',
                        width: '190px',
                        height: '270px',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.85), 0 0 35px rgba(59, 130, 246, 0.35)',
                        border: '2px solid rgba(255, 255, 255, 0.25)',
                        transform: 'rotate(-2deg)',
                        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                        background: '#0F172A',
                        zIndex: 20,
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'rotate(0deg) scale(1.05) translateY(-6px)';
                        e.currentTarget.style.boxShadow = '0 30px 60px -10px rgba(0, 0, 0, 0.95), 0 0 45px rgba(59, 130, 246, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'rotate(-2deg) scale(1)';
                        e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0,0,0,0.85), 0 0 35px rgba(59, 130, 246, 0.35)';
                      }}
                    >
                      {books.length > 0 && books[0].coverImage ? (
                        <img 
                          src={books[currentSlide % books.length]?.coverImage || books[0].coverImage} 
                          alt="Featured Center Book" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1E3A8A, #0F172A)', color: '#FFFFFF', padding: '16px', textAlign: 'center' }}>
                          <BookOpen size={42} style={{ color: '#60A5FA', marginBottom: '8px' }} />
                          <span style={{ fontSize: '0.813rem', fontWeight: 800 }}>DIGITAL LIBRARY</span>
                          <span style={{ fontSize: '0.688rem', color: '#94A3B8', marginTop: '4px' }}>Edisi Rekomendasi</span>
                        </div>
                      )}

                      {/* 3D Realistic Spine & Curved Highlight Effect */}
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.55) 0%, transparent 8%, transparent 92%, rgba(0,0,0,0.3) 100%)', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 40%, rgba(0,0,0,0.4) 100%)', pointerEvents: 'none' }} />
                    </div>

                    {/* 3. FLOATING GLASSMORPHISM BADGE (PEMBATAS INFORMASI ELEGAN) */}
                    <div 
                      style={{
                        position: 'absolute',
                        bottom: '-10px',
                        left: '-20px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '16px',
                        padding: '10px 16px',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        zIndex: 25
                      }}
                    >
                      <div style={{ width: '30px', height: '30px', borderRadius: '10px', background: '#2563EB', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 800, boxShadow: '0 4px 10px rgba(37,99,235,0.4)' }}>
                        ★
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>Peringkat Tertinggi</div>
                        <div style={{ fontSize: '0.688rem', color: '#CBD5E1' }}>4.9 / 5.0 (2,400+ Ulasan)</div>
                      </div>
                    </div>

                  </div>

                </div>

                {/* 4. DOCK NAVIGASI SLIDER DENGAN PROGRESS BAR ALA NETFLIX */}
                <div className="hero-nav-dock" style={{
                  position: 'absolute',
                  bottom: '20px',
                  right: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(2, 6, 23, 0.65)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  zIndex: 30
                }}>
                  {/* Tombol Kiri */}
                  <button
                    onClick={() => setCurrentSlide(prev => (prev - 1 + PROMO_SLIDES.length) % PROMO_SLIDES.length)}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'transparent',
                      border: 'none',
                      color: '#94A3B8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; }}
                    title="Slide Sebelumnya"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* Progress Bar Ala Netflix (3 Garis Horizontal Tipis) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {PROMO_SLIDES.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        style={{
                          height: '4px',
                          width: '32px',
                          borderRadius: '999px',
                          background: currentSlide === i ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)',
                          boxShadow: currentSlide === i ? '0 0 8px rgba(255, 255, 255, 0.8)' : 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        title={`Slide ${i + 1}`}
                      />
                    ))}
                  </div>

                  {/* Tombol Kanan */}
                  <button
                    onClick={() => setCurrentSlide(prev => (prev + 1) % PROMO_SLIDES.length)}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'transparent',
                      border: 'none',
                      color: '#94A3B8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; }}
                    title="Slide Berikutnya"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. SECTION: JELAJAHI KATEGORI (HORIZONTAL SCROLLING ROW) */}
          {/* ======================================================== */}
          {categories.length > 0 && !q && (
            <section style={{ marginBottom: '44px', width: '100%' }}>
              
              {/* Header Kategori dengan Tombol Navigasi Geser & Link */}
              <div className="category-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 className="category-title" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
                    Jelajahi Kategori
                  </h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Link 
                    href="/kategori" 
                    style={{
                      fontSize: '0.813rem',
                      fontWeight: 700,
                      color: '#2563EB',
                      textDecoration: 'none',
                      marginRight: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Lihat Semua <ArrowRight size={14} />
                  </Link>

                  <button 
                    onClick={() => scrollCategoriesManual('left')}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748B',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                    }}
                    title="Geser ke kiri"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <button 
                    onClick={() => scrollCategoriesManual('right')}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748B',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                    }}
                    title="Geser ke kanan"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
              
              {/* Horizontal Scroll Track (1 Baris Lurus ke Samping) */}
              <div 
                ref={categoryScrollRef}
                style={{
                  display: 'flex',
                  gap: '12px',
                  overflowX: 'auto',
                  paddingBottom: '8px',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  width: '100%',
                  scrollBehavior: 'smooth'
                }}
              >
                {categories.map(cat => {
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <div 
                      key={cat.id} 
                      className="category-card-mobile"
                      ref={(el) => { categoryItemRefs.current[cat.name] = el; }}
                      onClick={() => handleCategorySelect(cat.name)}
                      style={{
                        flex: '0 0 auto',
                        width: '136px',
                        background: isSelected ? '#EFF6FF' : '#FFFFFF',
                        border: `1.5px solid ${isSelected ? '#2563EB' : '#E2E8F0'}`,
                        borderRadius: '16px',
                        padding: '14px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        boxShadow: isSelected ? '0 4px 14px rgba(37,99,235,0.15)' : '0 1px 3px rgba(0,0,0,0.02)',
                        transition: 'all 0.25s ease',
                        userSelect: 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#93C5FD';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#E2E8F0';
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                        }
                      }}
                    >
                      <div className="category-icon-mobile" style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: isSelected ? '#DBEAFE' : '#F8FAFC',
                        color: isSelected ? '#1D4ED8' : '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}>
                        {cat.icon ? (
                          <img src={cat.icon} alt={cat.name} style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                        ) : (
                          getCategoryIcon(cat.name)
                        )}
                      </div>
                      <span className="category-text-mobile" style={{ fontSize: '0.813rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? '#1E40AF' : '#0F172A', textAlign: 'center', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                        {cat.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ======================================================== */}
          {/* SEARCH MATCHES (Ketika Sedang Mencari)                   */}
          {/* ======================================================== */}
          {q && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '40px', width: '100%' }}>
              
              {/* Matched Categories */}
              {searchCategories.length > 0 && (
                <section>
                  <h3 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748B', marginBottom: '12px' }}>
                    Kategori Terkait
                  </h3>
                  <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {searchCategories.map(cat => (
                      <button 
                        key={cat.id} 
                        onClick={() => setQuery(cat.name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 16px',
                          background: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          borderRadius: '10px',
                          fontSize: '0.813rem',
                          fontWeight: 700,
                          color: '#0F172A',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <Folder size={15} color="#64748B" />
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Matched Publishers */}
              {searchPublishers.length > 0 && (
                <section>
                  <h3 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748B', marginBottom: '12px' }}>
                    Penerbit Terkait
                  </h3>
                  <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {searchPublishers.map(pub => (
                      <div 
                        key={pub.id} 
                        onClick={() => router.push(`/penerbit/${pub.id}`)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '6px 16px',
                          background: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          borderRadius: '999px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <div style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: '#0F172A',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          overflow: 'hidden'
                        }}>
                          {pub.avatar ? <img src={pub.avatar} alt={pub.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : pub.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '0.813rem', fontWeight: 700, color: '#0F172A' }}>{pub.name}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Matched Authors */}
              {searchAuthors.length > 0 && (
                <section>
                  <h3 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748B', marginBottom: '12px' }}>
                    Penulis Terkait
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {searchAuthors.map(author => (
                      <button 
                        key={author} 
                        onClick={() => router.push(`/penulis/${encodeURIComponent(author)}`)}
                        style={{
                          padding: '6px 14px',
                          background: '#F1F5F9',
                          color: '#334155',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        #{author.replace(/\s+/g, '')}
                      </button>
                    ))}
                  </div>
                </section>
              )}

            </div>
          )}

          {/* ======================================================== */}
          {/* 3. SECTION: KOLEKSI UNGGULAN (DENGAN 4 FILTER & PAGINASI) */}
          {/* ======================================================== */}
          <section ref={booksSectionRef} style={{ width: '100%' }}>
            
            {/* HEADER SECTION + 4 TOMBOL FILTER BERSTANDAR CLEAN PREMIUM */}
            <div className="filter-header-section" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '28px',
              paddingBottom: '16px',
              borderBottom: '1px solid #E2E8F0'
            }}>
              
              {/* Judul Koleksi */}
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 4px' }}>
                  {q ? `Hasil Pencarian: "${q}"` : 'Koleksi Unggulan'}
                </h2>
                <p style={{ fontSize: '0.813rem', color: '#64748B', margin: 0 }}>
                  Menampilkan {filteredAndSortedBooks.length > 0 ? `${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedBooks.length)}` : 0} dari {filteredAndSortedBooks.length} total ebook pilihan
                </p>
              </div>

              {/* 4 FILTER CONTROLS (CLEAN & SIMPLE PREMIUM) */}
              <div className="filter-controls-wrapper" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                
                {/* 1. FILTER KATEGORI */}
                <div className="filter-item" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                  <div className="filter-item-icon" style={{ position: 'absolute', left: '12px', pointerEvents: 'none', color: selectedCategory !== 'ALL' ? '#2563EB' : '#64748B', display: 'flex', alignItems: 'center' }}>
                    <Layers size={14} />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategorySelect(e.target.value)}
                    style={{
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      padding: '8px 30px 8px 32px',
                      background: selectedCategory !== 'ALL' ? '#EFF6FF' : '#FFFFFF',
                      border: `1px solid ${selectedCategory !== 'ALL' ? '#93C5FD' : '#E2E8F0'}`,
                      color: selectedCategory !== 'ALL' ? '#1E40AF' : '#1E293B',
                      borderRadius: '10px',
                      fontSize: '0.813rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}
                  >
                    <option value="ALL">Semua Kategori</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <div style={{ position: 'absolute', right: '10px', pointerEvents: 'none', color: '#94A3B8', display: 'flex', alignItems: 'center' }}>
                    <ChevronDown size={13} />
                  </div>
                </div>

                {/* 2. FILTER WAKTU (BARU / LAMA) */}
                <div className="filter-item" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                  <div className="filter-item-icon" style={{ position: 'absolute', left: '12px', pointerEvents: 'none', color: selectedTimeSort !== 'NEWEST' ? '#2563EB' : '#64748B', display: 'flex', alignItems: 'center' }}>
                    <Clock size={14} />
                  </div>
                  <select
                    value={selectedTimeSort}
                    onChange={(e) => {
                      setSelectedTimeSort(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      padding: '8px 30px 8px 32px',
                      background: selectedTimeSort !== 'NEWEST' ? '#EFF6FF' : '#FFFFFF',
                      border: `1px solid ${selectedTimeSort !== 'NEWEST' ? '#93C5FD' : '#E2E8F0'}`,
                      color: selectedTimeSort !== 'NEWEST' ? '#1E40AF' : '#1E293B',
                      borderRadius: '10px',
                      fontSize: '0.813rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}
                  >
                    <option value="NEWEST">Terbaru</option>
                    <option value="OLDEST">Terlama</option>
                  </select>
                  <div style={{ position: 'absolute', right: '10px', pointerEvents: 'none', color: '#94A3B8', display: 'flex', alignItems: 'center' }}>
                    <ChevronDown size={13} />
                  </div>
                </div>

                {/* 3. FILTER RATING & VIEWS */}
                <div className="filter-item" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                  <div className="filter-item-icon" style={{ position: 'absolute', left: '12px', pointerEvents: 'none', color: selectedMetricFilter !== 'ALL' ? '#2563EB' : '#64748B', display: 'flex', alignItems: 'center' }}>
                    <Sparkles size={14} />
                  </div>
                  <select
                    value={selectedMetricFilter}
                    onChange={(e) => {
                      setSelectedMetricFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      padding: '8px 30px 8px 32px',
                      background: selectedMetricFilter !== 'ALL' ? '#EFF6FF' : '#FFFFFF',
                      border: `1px solid ${selectedMetricFilter !== 'ALL' ? '#93C5FD' : '#E2E8F0'}`,
                      color: selectedMetricFilter !== 'ALL' ? '#1E40AF' : '#1E293B',
                      borderRadius: '10px',
                      fontSize: '0.813rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}
                  >
                    <option value="ALL">Rating & Views</option>
                    <option value="RATING_HIGH">Rating 4.0+ Ke Atas</option>
                    <option value="RATING_LOW">Rating 4.0- Ke Bawah</option>
                    <option value="VIEWS_HIGH">Views Terbanyak</option>
                    <option value="VIEWS_LOW">Views Tersedikit</option>
                  </select>
                  <div style={{ position: 'absolute', right: '10px', pointerEvents: 'none', color: '#94A3B8', display: 'flex', alignItems: 'center' }}>
                    <ChevronDown size={13} />
                  </div>
                </div>

                {/* 4. TOMBOL RESET FILTER */}
                {isFilterActive && (
                  <button
                    onClick={resetAllFilters}
                    className="filter-reset-btn"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '8px 12px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      color: '#64748B',
                      borderRadius: '10px',
                      fontSize: '0.813rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#EF4444';
                      e.currentTarget.style.borderColor = '#FCA5A5';
                      e.currentTarget.style.background = '#FEF2F2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#64748B';
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.background = '#F8FAFC';
                    }}
                    title="Reset Semua Filter"
                  >
                    <RotateCcw size={12} /> Reset
                  </button>
                )}

              </div>
            </div>

            {/* GRID 10 BUKU */}
            {loading ? (
              <div className="books-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                gap: '36px 20px',
                width: '100%'
              }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '100%', aspectRatio: '2/3', background: '#E2E8F0', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
                    <div style={{ height: '14px', background: '#E2E8F0', borderRadius: '4px', marginTop: '12px', width: '80%' }} />
                    <div style={{ height: '12px', background: '#E2E8F0', borderRadius: '4px', marginTop: '6px', width: '50%' }} />
                  </div>
                ))}
              </div>
            ) : paginatedBooks.length === 0 ? (
              <div style={{
                background: '#FFFFFF',
                border: '2px dashed #E2E8F0',
                borderRadius: '20px',
                padding: '64px 24px',
                textAlign: 'center',
                width: '100%'
              }}>
                <BookOpen size={44} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>
                  Tidak ada ebook yang sesuai filter
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '0 0 16px' }}>
                  Coba ubah atau reset filter untuk melihat koleksi lainnya.
                </p>
                <button
                  onClick={resetAllFilters}
                  className="btn-primary"
                  style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '0.813rem' }}
                >
                  Tampilkan Semua Ebook
                </button>
              </div>
            ) : (
              /* 4. GRID BUKU DENGAN 5 KOLOM PAS & CENTER ALIGNED (MAKS 10 ITEM PER HALAMAN) */
              <div className="books-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                gap: '40px 24px',
                width: '100%'
              }}>
                {paginatedBooks.map(book => (
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
                      <h3 className="book-card-title" style={{
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
                      
                      <p className="book-card-author" style={{
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

                      {/* Rating & Total Views (Centered) */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Star size={13} color="#EAB308" fill="#EAB308" />
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155' }}>
                            {book.averageRating ? book.averageRating.toFixed(1) : '5.0'}
                          </span>
                        </div>
                        {book.totalViews > 0 && (
                          <>
                            <span style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>•</span>
                            <span style={{ fontSize: '0.688rem', fontWeight: 700, color: '#94A3B8' }}>
                              {book.totalViews.toLocaleString()} views
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* ======================================================== */}
            {/* 5. PAGINASI CLEAN SIMPLE PREMIUM (HITAM, NO GLOW, SIZE TERKONTROL) */}
            {/* ======================================================== */}
            {!loading && totalPages > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '40px',
                paddingTop: '20px',
                borderTop: '1px solid #F1F5F9'
              }}>
                
                {/* Tombol Sebelumnya (<) */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    color: currentPage === 1 ? '#CBD5E1' : '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== 1) {
                      e.currentTarget.style.background = '#F8FAFC';
                      e.currentTarget.style.borderColor = '#CBD5E1';
                      e.currentTarget.style.color = '#0F172A';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== 1) {
                      e.currentTarget.style.background = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.color = '#334155';
                    }
                  }}
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft size={15} />
                </button>

                {/* Angka Paginasi (1, 2, 3, 4, ...) */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        background: isActive ? '#0F172A' : '#FFFFFF',
                        border: `1px solid ${isActive ? '#0F172A' : '#E2E8F0'}`,
                        color: isActive ? '#FFFFFF' : '#475569',
                        fontSize: '0.813rem',
                        fontWeight: isActive ? 700 : 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = '#F8FAFC';
                          e.currentTarget.style.borderColor = '#CBD5E1';
                          e.currentTarget.style.color = '#0F172A';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = '#FFFFFF';
                          e.currentTarget.style.borderColor = '#E2E8F0';
                          e.currentTarget.style.color = '#475569';
                        }
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Tombol Berikutnya (>) */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    color: currentPage === totalPages ? '#CBD5E1' : '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== totalPages) {
                      e.currentTarget.style.background = '#F8FAFC';
                      e.currentTarget.style.borderColor = '#CBD5E1';
                      e.currentTarget.style.color = '#0F172A';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== totalPages) {
                      e.currentTarget.style.background = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.color = '#334155';
                    }
                  }}
                  title="Halaman Berikutnya"
                >
                  <ChevronRight size={15} />
                </button>

              </div>
            )}

          </section>

        </div>

      </div>
    </>
  );
}