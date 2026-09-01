'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Mail, Globe, Phone, Calendar, BookOpen, 
  Star, CheckCircle, ArrowLeft, ExternalLink,
  Building2, Search, X, Layers
} from 'lucide-react';

interface BookItem {
  id: string;
  title: string;
  author: string;
  coverImage: string | null;
  ratings: Array<{ score: number }>;
  _count?: { views: number };
}

interface PublisherData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  bio: string | null;
  website: string | null;
  banner: string | null;
  createdAt: string;
  books: BookItem[];
}

export default function PublisherClientView({ publisher }: { publisher: PublisherData }) {
  const [bookSearchQuery, setBookSearchQuery] = useState('');

  // Akumulasi statistik penerbit
  const totalBooks = publisher.books.length;
  const totalViews = publisher.books.reduce((acc, b) => acc + (b._count?.views || 0), 0);
  
  let totalRatingSum = 0;
  let totalRatingCount = 0;
  publisher.books.forEach(b => {
    b.ratings.forEach(r => {
      totalRatingSum += r.score;
      totalRatingCount++;
    });
  });
  const avgRating = totalRatingCount > 0 ? (totalRatingSum / totalRatingCount).toFixed(1) : '5.0';

  const formatJoinDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getWebsiteUrl = (url?: string | null) => {
    if (!url) return '';
    return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  };

  // Filter buku secara instan (real-time search)
  const filteredBooks = useMemo(() => {
    if (!bookSearchQuery.trim()) return publisher.books;
    const q = bookSearchQuery.toLowerCase().trim();
    return publisher.books.filter(b => 
      b.title.toLowerCase().includes(q) || 
      b.author.toLowerCase().includes(q)
    );
  }, [publisher.books, bookSearchQuery]);

  // Encoded safe origin parameter agar tombol "Kembali" di halaman buku kembali ke penerbit ini
  const fromParam = encodeURIComponent(`/penerbit/${publisher.id}`);

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', width: '100%', display: 'flex', justifyContent: 'center' }}>
      
      <style>{`
        /* --- MOBILE OPTIMIZATION - SEJAJAR & HEMAT RUANG --- */
        @media (max-width: 768px) {
          .pub-main-wrapper { padding: 20px 16px 80px !important; }
          .pub-hero-card { margin-bottom: 24px !important; border-radius: 18px !important; }
          .pub-banner { height: 110px !important; }
          .pub-hero-content { padding: 0 20px 24px !important; }
          
          /* Menyusun ulang Avatar dan Statistik agar compact */
          .pub-avatar-stats-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            margin-top: -40px !important;
            gap: 16px !important;
            margin-bottom: 16px !important;
          }
          .pub-avatar-wrapper {
            width: 80px !important;
            height: 80px !important;
          }
          
          /* KUNCI: MEMAKSA STATISTIK SEJAJAR KE SAMPING (3 KOLOM) */
          .pub-stats-container {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 8px !important;
          }
          .pub-stat-box {
            padding: 10px 4px !important;
            border-radius: 12px !important;
          }
          .pub-stat-number { font-size: 1.125rem !important; }
          .pub-stat-label { font-size: 0.55rem !important; letter-spacing: 0 !important; }
          
          .pub-name-row { gap: 8px !important; margin-bottom: 8px !important; }
          .pub-name { font-size: 1.4rem !important; }
          .pub-bio { font-size: 0.813rem !important; margin-bottom: 16px !important; }
          
          .pub-contact-strip {
            gap: 12px !important;
            padding-top: 16px !important;
            font-size: 0.75rem !important;
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          
          .pub-book-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
            margin-bottom: 20px !important;
            padding-bottom: 12px !important;
          }
          .pub-book-search { max-width: 100% !important; }
          
          /* KUNCI: BUKU JADI 2 KOLOM AGAR TIDAK CAPE SCROLL */
          .pub-book-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 20px 12px !important;
          }
          .pub-book-title { font-size: 0.813rem !important; }
          .pub-book-author { font-size: 0.7rem !important; }
        }
      `}</style>

      {/* 1. GLOBAL CONTAINER PENENGAH TERKUNCI (MAX-WIDTH 1240PX & MARGIN AUTO) */}
      <main className="pub-main-wrapper" style={{ width: '100%', maxWidth: '1240px', padding: '32px 24px 80px', margin: '0 auto', boxSizing: 'border-box' }}>
        
        {/* Tombol Kembali ke Beranda */}
        <Link 
          href="/" 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#64748B',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 700,
            marginBottom: '24px',
            transition: 'color 0.15s ease'
          }}
        >
          <ArrowLeft size={16} /> Kembali ke Beranda
        </Link>

        {/* ======================================================== */}
        {/* 2. HERO PUBLISHER PROFILE CARD (DENGAN BANNER, BIO & KONTAK) */}
        {/* ======================================================== */}
        <div className="pub-hero-card" style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          marginBottom: '44px'
        }}>
          
          {/* A. BANNER SAMPUL PENERBIT (16:9 / HIGH RES) */}
          <div className="pub-banner" style={{
            position: 'relative',
            width: '100%',
            height: '220px',
            background: publisher.banner 
              ? `url(${publisher.banner}) center / cover no-repeat`
              : 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #0F172A 100%)',
            borderBottom: '1px solid #E2E8F0'
          }}>
            {!publisher.banner && (
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 60%)',
                pointerEvents: 'none'
              }} />
            )}
          </div>

          {/* B. BADGE AVATAR, IDENTITAS & DETAIL KONTAK LENGKAP */}
          <div className="pub-hero-content" style={{ padding: '0 36px 36px', position: 'relative' }}>
            
            {/* Header Flex: Avatar di kiri + Ringkasan Statistik di kanan */}
            <div className="pub-avatar-stats-row" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '20px',
              marginTop: '-56px',
              marginBottom: '24px'
            }}>
              
              {/* Avatar Penerbit */}
              <div className="pub-avatar-wrapper" style={{
                position: 'relative',
                width: '112px',
                height: '112px',
                borderRadius: '50%',
                background: '#FFFFFF',
                padding: '4px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                flexShrink: 0
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: '#0F172A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF'
                }}>
                  {publisher.avatar ? (
                    <img 
                      src={publisher.avatar} 
                      alt={publisher.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <Building2 size={44} color="#94A3B8" />
                  )}
                </div>
              </div>

              {/* 3 Quick Stat Bento Badges */}
              <div className="pub-stats-container" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                
                {/* Total Ebook */}
                <div className="pub-stat-box" style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '10px 18px',
                  textAlign: 'center'
                }}>
                  <div className="pub-stat-number" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
                    {totalBooks}
                  </div>
                  <div className="pub-stat-label" style={{ fontSize: '0.688rem', fontWeight: 700, color: '#64748B', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Ebook Diterbitkan
                  </div>
                </div>

                {/* Total Pembaca / Views */}
                <div className="pub-stat-box" style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '10px 18px',
                  textAlign: 'center'
                }}>
                  <div className="pub-stat-number" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
                    {totalViews.toLocaleString()}
                  </div>
                  <div className="pub-stat-label" style={{ fontSize: '0.688rem', fontWeight: 700, color: '#64748B', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Total Pembaca
                  </div>
                </div>

                {/* Rating Koleksi */}
                <div className="pub-stat-box" style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '10px 18px',
                  textAlign: 'center'
                }}>
                  <div className="pub-stat-number" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Star size={16} color="#EAB308" fill="#EAB308" /> {avgRating}
                  </div>
                  <div className="pub-stat-label" style={{ fontSize: '0.688rem', fontWeight: 700, color: '#64748B', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Rating Rata-rata
                  </div>
                </div>

              </div>

            </div>

            {/* Nama & Badge Terverifikasi */}
            <div className="pub-name-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <h1 className="pub-name" style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                {publisher.name}
              </h1>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '999px',
                background: '#EFF6FF',
                color: '#2563EB',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: '1px solid #BFDBFE'
              }}>
                <CheckCircle size={13} /> Penerbit Terverifikasi
              </span>
            </div>

            {/* Deskripsi / Bio Profil Penerbit */}
            <p className="pub-bio" style={{
              fontSize: '0.938rem',
              color: publisher.bio ? '#334155' : '#94A3B8',
              lineHeight: 1.6,
              maxWidth: '800px',
              margin: '0 0 20px 0'
            }}>
              {publisher.bio || 'Penerbit ini belum menambahkan deskripsi profil.'}
            </p>

            {/* Strip Informasi Kontak & Metadata Resmi */}
            <div className="pub-contact-strip" style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #F1F5F9',
              fontSize: '0.813rem',
              color: '#64748B'
            }}>
              
              {/* Email / Gmail Resmi */}
              {publisher.email && (
                <a 
                  href={`mailto:${publisher.email}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#0F172A',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'color 0.15s'
                  }}
                  title="Hubungi via Email"
                >
                  <Mail size={15} color="#2563EB" />
                  <span>{publisher.email}</span>
                </a>
              )}

              {/* Tautan Website / Eksternal Link */}
              {publisher.website && (
                <a 
                  href={getWebsiteUrl(publisher.website)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#2563EB',
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'color 0.15s'
                  }}
                  title="Kunjungi Website Resmi"
                >
                  <Globe size={15} color="#2563EB" />
                  <span>{publisher.website.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink size={12} />
                </a>
              )}

              {/* Nomor Telepon / WhatsApp */}
              {publisher.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', fontWeight: 600 }}>
                  <Phone size={15} color="#64748B" />
                  <span>{publisher.phone}</span>
                </div>
              )}

              {/* Tanggal Bergabung */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B' }}>
                <Calendar size={15} color="#94A3B8" />
                <span>Bergabung sejak {formatJoinDate(publisher.createdAt)}</span>
              </div>

            </div>

          </div>

        </div>

        {/* ======================================================== */}
        {/* 3. SECTION: KOLEKSI EBOOK DENGAN PENCARIAN REAL-TIME      */}
        {/* ======================================================== */}
        <section style={{ width: '100%' }}>
          
          <div className="pub-book-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '28px',
            paddingBottom: '16px',
            borderBottom: '1px solid #E2E8F0'
          }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 4px' }}>
                Koleksi Ebook Diterbitkan
              </h2>
              <p style={{ fontSize: '0.813rem', color: '#64748B', margin: 0 }}>
                Menampilkan {filteredBooks.length} dari total {totalBooks} judul buku terbitan {publisher.name}
              </p>
            </div>

            {/* LIVE SEARCH BAR DI PROFILE PENERBIT */}
            <div className="pub-book-search" style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }}>
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Cari ebook penerbit ini..."
                value={bookSearchQuery}
                onChange={(e) => setBookSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 36px 9px 36px',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '12px',
                  fontSize: '0.813rem',
                  fontWeight: 600,
                  color: '#0F172A',
                  outline: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                  transition: 'border-color 0.15s ease'
                }}
              />
              {bookSearchQuery && (
                <button
                  onClick={() => setBookSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#F1F5F9',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748B',
                    cursor: 'pointer'
                  }}
                  title="Hapus Pencarian"
                >
                  <X size={12} />
                </button>
              )}
            </div>

          </div>

          {filteredBooks.length === 0 ? (
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
                {bookSearchQuery ? 'Ebook Tidak Ditemukan' : 'Belum Ada Ebook yang Diterbitkan'}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '0 0 16px' }}>
                {bookSearchQuery ? `Tidak ada karya yang cocok dengan kata kunci "${bookSearchQuery}".` : 'Penerbit ini belum memiliki e-book yang berstatus publikasi.'}
              </p>
              {bookSearchQuery && (
                <button
                  onClick={() => setBookSearchQuery('')}
                  style={{
                    background: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.813rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Reset Pencarian
                </button>
              )}
            </div>
          ) : (
            <div className="pub-book-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: '40px 24px',
              width: '100%'
            }}>
              {filteredBooks.map(book => {
                const bookRating = book.ratings.length 
                  ? book.ratings.reduce((acc, r) => acc + r.score, 0) / book.ratings.length 
                  : 0;

                return (
                  <Link 
                    key={book.id} 
                    href={`/books/${book.id}?from=${fromParam}`}
                    className="group"
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
                      className="transition-all duration-300 transform group-hover:-translate-y-1.5 group-hover:shadow-2xl"
                      style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '2/3',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
                        background: '#F1F5F9'
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
                      <h3 className="pub-book-title" style={{
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
                      
                      <p className="pub-book-author" style={{
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
                            {bookRating ? bookRating.toFixed(1) : '5.0'}
                          </span>
                        </div>
                        {(book._count?.views || 0) > 0 && (
                          <>
                            <span style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>•</span>
                            <span style={{ fontSize: '0.688rem', fontWeight: 700, color: '#94A3B8' }}>
                              {(book._count?.views || 0).toLocaleString()} views
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

        </section>

      </main>

    </div>
  );
}