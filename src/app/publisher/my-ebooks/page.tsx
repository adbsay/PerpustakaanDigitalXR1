'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Book {
  id: string;
  title: string;
  author: string;
  categoryName?: string;
  description: string | null;
  coverImage: string | null;
  pdfFile: string | null;
  status: 'PENDING' | 'PUBLISHED' | 'BANNED' | 'DRAFT';
  createdAt: string;
  totalViews?: number;
  averageRating?: number;
}

const statusBadge = (status: string) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    PUBLISHED: { bg: 'rgba(52,199,89,0.1)', color: '#2E7D32', label: 'Published' },
    PENDING:   { bg: 'rgba(255,149,0,0.1)',  color: '#E65100', label: 'Pending Review' },
    BANNED:    { bg: 'rgba(255,59,48,0.1)',   color: '#C62828', label: 'Banned' },
    DRAFT:     { bg: '#F5F5F5',               color: '#616161', label: 'Draft' },
  };
  const s = map[status] ?? map['DRAFT'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 8px', borderRadius: '4px',
      fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.02em',
      background: s.bg, color: s.color,
    }}>
      {s.label}
    </span>
  );
};

function ActionMenu({ bookId, bookTitle, deletingId, onDelete }: {
  bookId: string;
  bookTitle: string;
  deletingId: string;
  onDelete: (id: string, title: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const base: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 16px', fontSize: '0.875rem', fontWeight: 500,
    color: '#1A1A1A', cursor: 'pointer', background: 'transparent',
    border: 'none', width: '100%', textAlign: 'left',
    transition: 'background 0.12s ease', whiteSpace: 'nowrap',
  };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
        title="Lihat aksi"
        style={{
          background: open ? '#EBEBEB' : 'transparent',
          border: '1px solid #EAEAEA',
          borderRadius: '6px',
          width: '34px', height: '34px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: '18px', fontWeight: 900,
          color: '#555', transition: 'background 0.12s ease', lineHeight: 1,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#EBEBEB'; }}
        onMouseLeave={e => { if (!open) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
      >
        &#8943;
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          background: 'white', borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.13), 0 2px 6px rgba(0,0,0,0.06)',
          border: '1px solid #E8E8E8', minWidth: '185px', zIndex: 9999,
          overflow: 'hidden',
        }}>
          <Link
            href={`/publisher/my-ebooks/${bookId}/edit`}
            style={{ ...base, textDecoration: 'none' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F5F5F5'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            onClick={() => setOpen(false)}
          >
            <span>&#9999;&#65039;</span> Edit Ebook
          </Link>

          <div style={{ height: '1px', background: '#F0F0F0' }} />

          <button
            style={base}
            onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#EBF3FF'; el.style.color = '#1565C0'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = 'transparent'; el.style.color = '#1A1A1A'; }}
            onClick={() => { setOpen(false); router.push('/publisher/analytics'); }}
          >
            <span>&#128202;</span> View Analytics
          </button>

          <div style={{ height: '1px', background: '#F0F0F0' }} />

          <button
            style={{ ...base, color: '#D32F2F', fontWeight: 600 }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FFF0F0'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            onClick={() => { setOpen(false); onDelete(bookId, bookTitle); }}
            disabled={deletingId === bookId}
          >
            <span>&#128465;</span> {deletingId === bookId ? 'Menghapus...' : 'Hapus Ebook'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function MyEbooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');
  const [toast, setToast] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const token = localStorage.getItem('publisher_token');
    if (!token) return;
    setLoading(true);

    try {
      const res = await fetch('/api/publisher/books', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setBooks(json.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus "${title}"? Tindakan ini tidak bisa dibatalkan.`)) return;

    const token = localStorage.getItem('publisher_token');
    setDeletingId(id);

    try {
      const res = await fetch(`/api/publisher/books/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setBooks(prev => prev.filter(b => b.id !== id));
        showToast('Ebook berhasil dihapus');
      }
    } finally {
      setDeletingId('');
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const filteredBooks = books.filter(book => {
    const matchSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || book.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">My Ebooks</h1>
          <p className="page-subtitle">Kelola, perbarui, dan pantau performa koleksi buku yang telah Anda terbitkan.</p>
        </div>
        <Link href="/publisher/upload" id="add-ebook-btn" className="btn btn-primary">
          + Add New Ebook
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '300px' }}>
          <input
            type="text"
            placeholder="Cari judul buku..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #EAEAEA', flex: '1 1 auto', maxWidth: '400px', fontSize: '0.875rem' }}
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #EAEAEA', background: 'white', fontSize: '0.875rem' }}
          >
            <option value="ALL">Semua Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="PENDING">Pending Review</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '4px', background: '#F4F3F0', padding: '4px', borderRadius: '8px' }}>
          <button 
            onClick={() => setViewMode('grid')}
            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: viewMode === 'grid' ? 'white' : 'transparent', boxShadow: viewMode === 'grid' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', fontWeight: 600, color: viewMode === 'grid' ? '#1A1A1A' : '#9B9B9B', fontSize: '0.875rem' }}
          >
            Grid
          </button>
          <button 
            onClick={() => setViewMode('list')}
            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: viewMode === 'list' ? 'white' : 'transparent', boxShadow: viewMode === 'list' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', fontWeight: 600, color: viewMode === 'list' ? '#1A1A1A' : '#9B9B9B', fontSize: '0.875rem' }}
          >
            List
          </button>
        </div>
      </div>

      {loading ? (
          <div className="ebook-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="ebook-card">
                <div className="skeleton" style={{ width: '100%', aspectRatio: '3/4' }} />
                <div style={{ padding: 14 }}>
                  <div className="skeleton" style={{ height: 14, borderRadius: 4, width: '80%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 12, borderRadius: 4, width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
      ) : books.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <div className="empty-state-title">Belum ada ebook</div>
            <div className="empty-state-text">Upload ebook pertama kamu sekarang</div>
            <Link href="/publisher/upload" className="btn btn-primary" style={{ marginTop: 16 }}>
              Upload Ebook
            </Link>
          </div>
      ) : filteredBooks.length === 0 ? (
          <div className="empty-state" style={{ padding: '64px 0' }}>
            <div className="empty-state-title">Tidak ada hasil ditemukan</div>
            <div className="empty-state-text">Coba sesuaikan pencarian atau filter status.</div>
          </div>
      ) : viewMode === 'list' ? (
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #EAEAEA' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ background: '#F9F9F9', borderBottom: '1px solid #EAEAEA' }}>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#6B6B6B', fontWeight: 600, fontSize: '0.875rem' }}>Buku</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#6B6B6B', fontWeight: 600, fontSize: '0.875rem' }}>Status</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#6B6B6B', fontWeight: 600, fontSize: '0.875rem' }}>Performa</th>
                    <th style={{ padding: '16px', textAlign: 'right', color: '#6B6B6B', fontWeight: 600, fontSize: '0.875rem' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((book) => (
                    <tr key={book.id} style={{ borderBottom: '1px solid #EAEAEA' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '56px', borderRadius: '6px', overflow: 'hidden', background: '#F4F3F0' }}>
                            {book.coverImage ? <img src={book.coverImage} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '20px' }}>📖</div>}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.938rem', marginBottom: '4px' }}>{book.title}</div>
                            <div style={{ fontSize: '0.75rem', color: '#9B9B9B' }}>by {book.author}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {statusBadge(book.status)}
                      </td>
                      <td style={{ padding: '16px' }}>
                         <div style={{ display: 'flex', gap: '12px' }}>
                            <span style={{ fontSize: '0.813rem', color: '#6B6B6B', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{fontSize: '1rem'}}>👁</span> {book.totalViews ?? 0}</span>
                            <span style={{ fontSize: '0.813rem', color: '#6B6B6B', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{fontSize: '1rem'}}>⭐</span> {book.averageRating ? book.averageRating.toFixed(1) : '0.0'}</span>
                         </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <ActionMenu
                          bookId={book.id}
                          bookTitle={book.title}
                          deletingId={deletingId}
                          onDelete={handleDelete}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
      ) : (
          <div className="ebook-grid">
            {filteredBooks.map(book => (
              <div key={book.id} className="ebook-card" style={{ position: 'relative', overflow: 'visible' }}>
                <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
                  <ActionMenu
                    bookId={book.id}
                    bookTitle={book.title}
                    deletingId={deletingId}
                    onDelete={handleDelete}
                  />
                </div>

                {book.coverImage ? (
                  <img src={book.coverImage} alt={book.title} className="ebook-card-cover" style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }} />
                ) : (
                  <div className="ebook-card-cover-placeholder" style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>📖</div>
                )}

                <div className="ebook-card-body">
                  <div className="ebook-card-title" style={{ paddingRight: 24 }}>{book.title}</div>
                  <div className="ebook-card-author">by {book.author}</div>
                  <div style={{ marginTop: 8 }}>
                    {statusBadge(book.status)}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F0F0F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B6B6B', fontSize: '0.75rem', fontWeight: 500 }}>
                      <span style={{ fontSize: '1rem' }}>👁</span> {book.totalViews ?? 0}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B6B6B', fontSize: '0.75rem', fontWeight: 500 }}>
                      <span style={{ fontSize: '1rem' }}>⭐</span> {book.averageRating ? book.averageRating.toFixed(1) : '0.0'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
      )}

      {toast && (
        <div className="toast-container">
          <div className="toast success">{toast}</div>
        </div>
      )}
    </>
  );
}
