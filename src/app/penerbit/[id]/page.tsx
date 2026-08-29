import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function PublisherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const publisher = await prisma.publisher.findFirst({
    where: { id: id, status: 'ACTIVE' },
    include: {
      books: {
        where: { status: 'PUBLISHED' },
        include: { ratings: true, _count: { select: { views: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!publisher) {
    return notFound();
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

        {/* Publisher Profile Header */}
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
            width: '120px', height: '120px', borderRadius: '50%', background: '#F5F5F5',
            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, border: '4px solid #F9F6F0'
          }}>
            {publisher.avatar ? (
              <img src={publisher.avatar} alt={publisher.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '48px', fontWeight: 600, color: '#999' }}>{publisher.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1A1A1A', margin: '0 0 8px 0' }}>
              {publisher.name}
            </h1>
            <div style={{ display: 'flex', gap: '24px', color: '#666', fontSize: '14px' }}>
              <div><strong>{publisher.books.length}</strong> Ebook Diterbitkan</div>
            </div>
          </div>
        </div>

        {/* Publisher Books */}
        <div className="section-header" style={{ marginBottom: '24px' }}>
          <h2 className="section-title">Koleksi Ebook Penerbit</h2>
        </div>

        {publisher.books.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-title">Belum ada ebook yang diterbitkan</div>
          </div>
        ) : (
          <div className="books-grid">
            {publisher.books.map(book => {
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
                    <div className="book-card-author">{book.author}</div>
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
        )}

      </main>
    </div>
  );
}
