import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function AuthorProfilePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const authorName = decodeURIComponent(name);
  
  // Find all published books by this author
  const books = await prisma.book.findMany({
    where: { 
      author: authorName, 
      status: 'PUBLISHED' 
    },
    include: { 
      publisher: { select: { name: true } },
      ratings: true, 
      _count: { select: { views: true } } 
    },
    orderBy: { createdAt: 'desc' }
  });

  if (books.length === 0) {
    return notFound(); // Author has no published books or doesn't exist
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < Math.round(rating) ? '#F5A623' : '#D9D9D9', fontSize: '11px' }}>★</span>
    ));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
      <main style={{ padding: '60px 40px', maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Back Button */}
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px', 
          color: '#666', textDecoration: 'none', fontSize: '14px', 
          fontWeight: 600, marginBottom: '24px', transition: 'color 0.2s'
        }}>
          <span style={{ fontSize: '18px' }}>←</span> Kembali ke Pencarian
        </Link>

        {/* Author Profile Header */}
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '24px',
          border: '1px solid #EAEAEA',
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
          marginBottom: '48px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.02)'
        }}>
          <div style={{ 
            width: '100px', height: '100px', borderRadius: '24px', background: '#F9F6F0',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <span style={{ fontSize: '40px' }}>✍️</span>
          </div>
          <div>
            <div style={{ color: '#C9A96E', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              Profil Penulis
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1A1A1A', margin: '0 0 8px 0' }}>
              {authorName}
            </h1>
            <div style={{ color: '#666', fontSize: '14px' }}>
              <strong>{books.length}</strong> Ebook Tersedia
            </div>
          </div>
        </div>

        {/* Author Books */}
        <div className="section-header" style={{ marginBottom: '24px' }}>
          <h2 className="section-title">Koleksi Buku {authorName}</h2>
        </div>

        <div className="books-grid">
          {books.map(book => {
            const avgRating = book.ratings.length 
              ? book.ratings.reduce((acc, r) => acc + r.score, 0) / book.ratings.length 
              : 0;

            return (
              <Link key={book.id} href={`/books/${book.id}`} className="book-card">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="book-cover"
                  />
                ) : (
                  <div className="book-cover-placeholder">📖</div>
                )}
                <div className="book-card-info">
                  <div className="book-card-title">{book.title}</div>
                  {book.publisher?.name && (
                    <div className="book-card-publisher">{book.publisher.name}</div>
                  )}
                  {avgRating > 0 && (
                    <div style={{ marginTop: 3, display: 'flex', gap: 1 }}>
                      {renderStars(avgRating)}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

      </main>
    </div>
  );
}
