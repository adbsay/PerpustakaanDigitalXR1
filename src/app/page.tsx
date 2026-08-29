'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearch } from '@/context/SearchContext';
import { useRouter } from 'next/navigation';

interface Book {
  id: string;
  title: string;
  author: string;
  categoryName?: string;
  coverImage: string | null;
  publisherName: string | null;
  averageRating: number;
  totalViews: number;
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

export default function HomePage() {
  return (
    <Suspense fallback={<div />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  // Base state for homepage (no query)
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Search state (when query exists)
  const [searchCategories, setSearchCategories] = useState<Category[]>([]);
  const [searchPublishers, setSearchPublishers] = useState<Publisher[]>([]);
  const [searchAuthors, setSearchAuthors] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);

  // Listen to search context — NO router needed
  const { query: q, setQuery } = useSearch();
  const router = useRouter();

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cancel any in-flight search requests
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

  const fetchBooks = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const res = await fetch('/api/books', { signal });
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

  // When user clicks a category/publisher/author chip, set query in context
  const handleSearch = (value: string) => {
    setQuery(value);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < Math.round(rating) ? '#F5A623' : '#D9D9D9', fontSize: '11px' }}>★</span>
    ));
  };

  return (
    <>
      {/* ---- MAIN CONTENT ---- */}
      <main className="visitor-main">

        {/* Default Categories Section (Only shown when not searching) */}
        {categories.length > 0 && !q && (
          <section style={{ marginBottom: 48 }}>
            <div className="section-header">
              <h2 className="section-title">Jelajahi Kategori</h2>
            </div>
            <div style={{
              display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', 
              scrollbarWidth: 'none', msOverflowStyle: 'none'
            }}>
              {categories.map(cat => (
                <div key={cat.id} style={{
                  minWidth: '100px', padding: '12px', background: 'white', border: '1px solid #EAEAEA',
                  borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: '8px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#C9A96E'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = '#EAEAEA'; }}
                onClick={() => handleSearch(cat.name)}
                >
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: '#F9F6F0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {cat.icon ? (
                      <img src={cat.icon} alt={cat.name} style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '18px' }}>📁</span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1A1A1A', textAlign: 'center' }}>
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Search Results Sections (Only shown when searching) */}
        {q && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '48px' }}>
            
            {/* Matched Categories */}
            {searchCategories.length > 0 && (
              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: '#666', marginBottom: '16px' }}>
                  Kategori Terkait
                </h3>
                <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                  {searchCategories.map(cat => (
                    <div key={cat.id} onClick={() => handleSearch(cat.name)} style={{
                      minWidth: '100px', padding: '12px', background: 'white', border: '1px solid #EAEAEA',
                      borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: '8px', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C9A96E'; e.currentTarget.style.background = '#FAFAF8'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EAEAEA'; e.currentTarget.style.background = 'white'; }}
                    >
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#F9F6F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {cat.icon ? <img src={cat.icon} alt={cat.name} style={{ width: '22px', height: '22px', objectFit: 'contain' }} /> : <span style={{ fontSize: '18px' }}>📁</span>}
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1A1A1A', textAlign: 'center' }}>{cat.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Matched Publishers */}
            {searchPublishers.length > 0 && (
              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: '#666', marginBottom: '16px' }}>
                  Penerbit Terkait
                </h3>
                <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                  {searchPublishers.map(pub => (
                    <div key={pub.id} onClick={() => router.push(`/penerbit/${pub.id}`)} style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px',
                      background: 'white', border: '1px solid #EAEAEA', borderRadius: '99px',
                      cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C9A96E'; e.currentTarget.style.background = '#FAFAF8'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EAEAEA'; e.currentTarget.style.background = 'white'; }}
                    >
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F5F5F5', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {pub.avatar ? <img src={pub.avatar} alt={pub.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '14px', fontWeight: 600, color: '#999' }}>{pub.name.charAt(0)}</span>}
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>{pub.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Matched Authors */}
            {searchAuthors.length > 0 && (
              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: '#666', marginBottom: '16px' }}>
                  Penulis Terkait
                </h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {searchAuthors.map(author => (
                    <div key={author} onClick={() => router.push(`/penulis/${encodeURIComponent(author)}`)} style={{
                      padding: '8px 16px', background: '#F4F3F0', color: '#C9A96E',
                      borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#E8E5DF'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#F4F3F0'; }}
                    >
                      #{author.replace(/\s+/g, '')}
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}

        {/* Featured / All Ebooks */}
        <section style={{ marginBottom: 48 }}>
          <div className="section-header">
            <h2 className="section-title">
              {q ? `Hasil pencarian: "${q}"` : 'Featured Ebooks'}
            </h2>
          </div>

          {loading ? (
            <div className="books-grid">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i}>
                  <div className="skeleton" style={{ width: '100%', aspectRatio: '2/3', borderRadius: 8 }} />
                  <div className="skeleton" style={{ height: 14, marginTop: 8, borderRadius: 4, width: '80%' }} />
                  <div className="skeleton" style={{ height: 12, marginTop: 4, borderRadius: 4, width: '60%' }} />
                </div>
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-title">
                {q ? 'Tidak ada buku ditemukan' : 'Belum ada buku tersedia'}
              </div>
              <div className="empty-state-text">
                {q ? 'Coba kata kunci yang berbeda' : 'Publisher sedang menambahkan koleksi ebook'}
              </div>
            </div>
          ) : (
            <div className="books-grid">
              {books.map(book => (
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
                    {book.publisherName && (
                      <div className="book-card-publisher">{book.publisherName}</div>
                    )}
                    {book.averageRating > 0 && (
                      <div style={{ marginTop: 3, display: 'flex', gap: 1 }}>
                        {renderStars(book.averageRating)}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>


      </main>
    </>
  );
}
