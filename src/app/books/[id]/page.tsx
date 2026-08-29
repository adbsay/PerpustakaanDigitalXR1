'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Book {
  id: string;
  title: string;
  author: string;
  categoryId: string | null;
  categoryName?: string;
  description: string | null;
  coverImage: string | null;
  pdfFile: string | null;
  publisherName: string | null;
  publisherAvatar: string | null;
  averageRating: number;
  totalViews: number;
  createdAt: string;
}

export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [recommended, setRecommended] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingDone, setRatingDone] = useState(false);
  const [bookId, setBookId] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    params.then(p => {
      setBookId(p.id);
      fetchBook(p.id);
    });
  }, []);

  const fetchBook = async (id: string) => {
    try {
      const res = await fetch(`/api/books/${id}`);
      const json = await res.json();
      if (json.success) {
        setBook(json.data);
        fetchRecommended(id);
      } else {
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommended = async (currentId: string) => {
    try {
      const res = await fetch('/api/books?limit=6');
      const json = await res.json();
      if (json.success) {
        setRecommended(json.data.filter((b: Book) => b.id !== currentId).slice(0, 4));
      }
    } catch {}
  };

  const handleRating = async (score: number) => {
    if (ratingDone) return;
    setUserRating(score);
    setRatingDone(true);
    try {
      await fetch(`/api/books/${bookId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score }),
      });
      showToast('Terima kasih atas rating-mu!');
      fetchBook(bookId);
    } catch {}
  };

  const handleDownload = () => {
    if (book?.pdfFile) {
      const link = document.createElement('a');
      link.href = book.pdfFile;
      link.download = `${book.title}.pdf`;
      link.click();
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: book?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link berhasil disalin!');
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#111' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!book) return null;

  const stars = [1, 2, 3, 4, 5];
  
  // Publisher Initials for Avatar
  const pubInitials = book.publisherName 
    ? book.publisherName.substring(0,2).toUpperCase() 
    : 'PB';

  return (
    <>
      <style>{`
        .bdp { 
          min-height: 100vh; 
          background: #FAFAF8; 
          position: relative;
          color: #1A1A1A;
          font-family: 'Inter', system-ui, sans-serif;
        }
        
        /* Dynamic Background */
        .bdp-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }
        .bdp-bg-img {
          position: absolute;
          inset: -10%;
          width: 120%;
          height: 120%;
          background-size: cover;
          background-position: center;
          filter: blur(60px) brightness(0.9);
          opacity: 0.5;
        }
        .bdp-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(250,250,248,0.7) 0%, rgba(250,250,248,1) 80%);
        }

        .bdp-nav {
          position: relative;
          z-index: 10;
          padding: 24px 48px;
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .bdp-nav a {
          color: #1A1A1A;
          text-decoration: none;
          opacity: 0.6;
          transition: opacity 0.2s;
        }
        .bdp-nav a:hover { opacity: 1; }
        
        .bdp-container {
          position: relative;
          z-index: 10;
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 48px 80px;
        }
        
        .divider {
          height: 1px;
          background: rgba(0,0,0,0.1);
          margin: 48px 0;
          width: 100%;
        }
        .divider.double {
          border-top: 1px solid rgba(0,0,0,0.1);
          border-bottom: 1px solid rgba(0,0,0,0.1);
          height: 4px;
          background: transparent;
        }

        /* Hero */
        .hero {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 64px;
          align-items: center;
          margin-top: 40px;
        }
        .hero-cover {
          width: 100%;
          aspect-ratio: 2/3;
          border-radius: 4px;
          box-shadow: 0 24px 48px rgba(0,0,0,0.15);
          object-fit: cover;
          display: block;
        }
        .hero-no-cover {
          width: 100%;
          aspect-ratio: 2/3;
          background: #EBEBEB;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          border-radius: 4px;
        }
        .hero-info {
          display: flex;
          flex-direction: column;
        }
        .hero-title {
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        .hero-author {
          font-size: 1.1rem;
          color: #666;
          margin-bottom: 32px;
        }
        .hero-meta {
          font-family: monospace;
          font-size: 0.85rem;
          color: #1A1A1A;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .hero-stats {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 48px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        
        .action-btns {
          display: flex;
          gap: 16px;
        }
        .btn-black {
          background: #1A1A1A;
          color: #fff;
          border: 1px solid #1A1A1A;
          padding: 14px 28px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          border-radius: 2px;
        }
        .btn-black:hover {
          background: transparent;
          color: #1A1A1A;
        }
        .btn-outline {
          background: transparent;
          color: #1A1A1A;
          border: 1px solid #1A1A1A;
          padding: 14px 28px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          border-radius: 2px;
        }
        .btn-outline:hover {
          background: #1A1A1A;
          color: #fff;
        }

        /* Body Split */
        .content-split {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 80px;
        }
        .section-title {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #1A1A1A;
          margin-bottom: 32px;
        }
        .desc-text {
          font-size: 1.05rem;
          line-height: 1.8;
          color: #333;
          white-space: pre-line;
        }

        .info-group {
          margin-bottom: 24px;
        }
        .info-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #999;
          margin-bottom: 6px;
        }
        .info-value {
          font-size: 0.95rem;
          font-weight: 500;
          color: #1A1A1A;
        }
        
        .pub-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 8px;
        }
        .pub-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #fff;
          color: #1A1A1A;
          border: 1px solid rgba(0,0,0,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
        }

        /* Rating Section */
        .rating-section {
          text-align: center;
          padding: 20px 0;
        }
        .rating-stars {
          display: flex;
          gap: 12px;
          justify-content: center;
          font-size: 2rem;
          margin-top: 16px;
        }
        .star {
          color: rgba(0,0,0,0.15);
          cursor: pointer;
          transition: transform 0.2s, color 0.2s;
        }
        .star:hover { transform: scale(1.2); }
        .star.filled { color: #1A1A1A; }
        
        .rating-thanks {
          display: inline-block;
          margin-top: 16px;
          padding: 12px 24px;
          background: #1A1A1A;
          color: #fff;
          font-size: 0.85rem;
          font-weight: 500;
          border-radius: 2px;
        }

        /* Recommendation Section */
        .recommended-section {
          padding-top: 48px;
        }
        .rec-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-top: 32px;
        }
        .rec-card {
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: transform 0.2s;
        }
        .rec-card:hover {
          transform: translateY(-4px);
        }
        .rec-cover {
          width: 100%;
          aspect-ratio: 2/3;
          border-radius: 4px;
          object-fit: cover;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .rec-no-cover {
          width: 100%;
          aspect-ratio: 2/3;
          border-radius: 4px;
          background: #EBEBEB;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        .rec-title {
          font-size: 0.9rem;
          font-weight: 700;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .rec-author {
          font-size: 0.8rem;
          color: #666;
        }

        @media (max-width: 768px) {
          .hero { grid-template-columns: 1fr; gap: 40px; }
          .hero-cover { max-width: 240px; margin: 0 auto; }
          .hero-info { text-align: center; align-items: center; }
          .content-split { grid-template-columns: 1fr; gap: 48px; }
          .bdp-container { padding: 0 24px 80px; }
          .rec-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="bdp">
        {/* Dynamic Cover Background Overlay */}
        <div className="bdp-bg">
          {book.coverImage && (
            <div className="bdp-bg-img" style={{ backgroundImage: `url(${book.coverImage})` }} />
          )}
          <div className="bdp-bg-overlay" />
        </div>

        {/* Navbar */}
        <div className="bdp-nav">
          <Link href="/">← KEMBALI</Link>
          <span style={{ opacity: 0.3 }}>|</span>
          <span style={{ opacity: 0.6 }}>{book.title}</span>
        </div>

        <div className="bdp-container">
          
          <div className="divider double" style={{ marginTop: 20 }}></div>

          {/* Hero Section */}
          <div className="hero">
            <div style={{ width: '100%' }}>
              {book.coverImage 
                ? <img src={book.coverImage} alt={book.title} className="hero-cover" />
                : <div className="hero-no-cover">📖</div>
              }
            </div>
            
            <div className="hero-info">
              <h1 className="hero-title">{book.title}</h1>
              <div className="hero-author">{book.author}</div>
              
              <div className="hero-meta">
                {book.categoryName && <span>{book.categoryName}</span>}
                {book.categoryName && <span>•</span>}
                <span>Format PDF</span>
              </div>

              <div className="hero-stats">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#1A1A1A', fontSize: '1.2rem' }}>★</span>
                  <span>{book.averageRating > 0 ? book.averageRating.toFixed(1) : '0.0'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '1.2rem' }}>👁</span>
                  <span>{book.totalViews} pembaca</span>
                </div>
              </div>

              <div className="action-btns">
                {book.pdfFile && (
                  <button className="btn-black" onClick={handleDownload}>
                    <span>↓</span> BACA GRATIS
                  </button>
                )}
                <button className="btn-outline" onClick={handleShare}>
                  <span>🔗</span> BAGIKAN
                </button>
              </div>
            </div>
          </div>

          <div className="divider double"></div>

          {/* Middle Content */}
          <div className="content-split">
            {/* Left Column */}
            <div>
              <div className="section-title">TENTANG BUKU</div>
              <p className="desc-text">
                {book.description || 'Deskripsi belum tersedia untuk buku ini.'}
              </p>
            </div>

            {/* Right Column */}
            <div>
              <div className="section-title">INFORMASI</div>
              
              <div className="info-group">
                <div className="info-label">Penulis</div>
                <div className="info-value">{book.author}</div>
              </div>
              
              <div className="info-group">
                <div className="info-label">Penerbit</div>
                <div className="pub-profile">
                  {book.publisherAvatar ? (
                    <img src={book.publisherAvatar} alt="Publisher" className="pub-avatar" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div className="pub-avatar">{pubInitials}</div>
                  )}
                  <div className="info-value">{book.publisherName || 'Anonim'}</div>
                </div>
              </div>

              <div className="info-group">
                <div className="info-label">Tanggal Rilis</div>
                <div className="info-value">{book.createdAt}</div>
              </div>
            </div>
          </div>

          <div className="divider double"></div>

          {/* Rating Section */}
          <div className="rating-section">
            <div className="section-title" style={{ marginBottom: 16 }}>BERIKAN PENILAIAN</div>
            {!ratingDone ? (
              <div className="rating-stars">
                {stars.map(s => (
                  <span key={s} 
                    className={`star ${(hoverRating || userRating) >= s ? 'filled' : ''}`}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleRating(s)}
                  >
                    {(hoverRating || userRating) >= s ? '★' : '☆'}
                  </span>
                ))}
              </div>
            ) : (
              <div className="rating-thanks">
                TERIMA KASIH ATAS PENILAIAN ANDA
              </div>
            )}
          </div>

          <div className="divider double"></div>

          {/* Recommended Section */}
          {recommended.length > 0 && (
            <div className="recommended-section">
              <div className="section-title">REKOMENDASI EBOOK LAINNYA</div>
              <div className="rec-grid">
                {recommended.map(r => (
                  <Link key={r.id} href={`/books/${r.id}`} className="rec-card">
                    {r.coverImage ? (
                      <img src={r.coverImage} alt={r.title} className="rec-cover" />
                    ) : (
                      <div className="rec-no-cover">📖</div>
                    )}
                    <div>
                      <div className="rec-title">{r.title}</div>
                      <div className="rec-author">{r.author}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
        </div>
      </div>
      {toast && <div className="toast-container"><div className="toast success">{toast}</div></div>}
    </>
  );
}
