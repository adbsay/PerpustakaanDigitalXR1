'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePublisherI18n } from '@/lib/publisherI18n';

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

const statusBadge = (status: string, labels: any) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    PUBLISHED: { bg: 'rgba(52,199,89,0.1)', color: '#2E7D32', label: labels.status.published },
    PENDING:   { bg: 'rgba(255,149,0,0.1)',  color: '#E65100', label: labels.status.pending },
    BANNED:    { bg: 'rgba(255,59,48,0.1)',   color: '#C62828', label: labels.status.banned },
    DRAFT:     { bg: '#F5F5F5',               color: '#616161', label: labels.status.draft },
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

function ActionMenu({ book, deletingId, onDelete, onViewInLibrary, labels }: {
  book: Book;
  deletingId: string;
  onDelete: (id: string, title: string) => void;
  onViewInLibrary: (book: Book) => void;
  labels: any;
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
        title={labels.table.actions}
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
            href={`/publisher/my-ebooks/${book.id}/edit`}
            style={{ ...base, textDecoration: 'none' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F5F5F5'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            onClick={() => setOpen(false)}
          >
            <span>&#9999;&#65039;</span> {labels.actions.edit}
          </Link>
          <div style={{ height: '1px', background: '#F0F0F0' }} />
          <button
            style={base}
            onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#EBF3FF'; el.style.color = '#1565C0'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = 'transparent'; el.style.color = '#1A1A1A'; }}
            onClick={() => { setOpen(false); onViewInLibrary(book); }}
          >
            <span>&#128202;</span> {labels.actions.view}
          </button>
          <div style={{ height: '1px', background: '#F0F0F0' }} />
          <button
            style={{ ...base, color: '#D32F2F', fontWeight: 600 }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FFF0F0'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            onClick={() => { setOpen(false); onDelete(book.id, book.title); }}
            disabled={deletingId === book.id}
          >
            <span>&#128465;</span> {deletingId === book.id ? labels.actions.deleting : labels.actions.delete}
          </button>
        </div>
      )}
    </div>
  );
}

export default function MyEbooksPage() {
  const { lang, t, formatDate } = usePublisherI18n();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');
  const [toast, setToast] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewBook, setPreviewBook] = useState<Book | null>(null);

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
    if (!confirm(`${t.myEbooks.actions.confirmDeleteDesc} (${title})`)) return;

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
        showToast(lang === 'en' ? 'Ebook successfully deleted' : 'Ebook berhasil dihapus');
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
      <style>{`
        /* DEFAULT DESKTOP HIDDEN CLASSES */
        .pub-mobile-list { display: none; }

        /* MOBILE VIEW OPTIMIZATIONS */
        @media (max-width: 768px) {
          .page-header { flex-direction: column !important; align-items: stretch !important; gap: 12px; padding: 16px !important; }
          #add-ebook-btn { width: 100%; justify-content: center; }
          
          .pub-controls-wrapper { flex-direction: column !important; align-items: stretch !important; margin: 16px !important; gap: 12px !important; }
          .pub-search-filters { flex-direction: column !important; gap: 10px !important; width: 100%; min-width: 100% !important; }
          .pub-search-filters input, .pub-search-filters select { width: 100% !important; max-width: 100% !important; }
          
          .pub-view-toggle { width: 100%; justify-content: center; background: #F4F3F0; padding: 4px; border-radius: 8px; }
          .pub-view-toggle button { flex: 1; }

          /* GRID VIEW MOBILE (1 Kolom Besar Vertikal) */
          .ebook-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; padding: 16px !important; }
          /* LIST VIEW MOBILE (List Kecil Vertikal) */
          .pub-table-container { display: none !important; }
          .pub-mobile-list { display: flex !important; flex-direction: column; gap: 12px; padding: 0 16px 16px; }
        }
      `}</style>
      
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div>
          <h1 className="page-title">{t.myEbooks.title}</h1>
          <p className="page-subtitle">{t.myEbooks.subtitle}</p>
        </div>
        <Link href="/publisher/upload" id="add-ebook-btn" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '6px' }}>+</span> {t.myEbooks.addNew}
        </Link>
      </div>

      <div className="pub-controls-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div className="pub-search-filters" style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '300px' }}>
          <input
            type="text"
            placeholder={t.myEbooks.searchPlaceholder}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #EAEAEA', flex: '1 1 auto', maxWidth: '400px', fontSize: '0.875rem' }}
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #EAEAEA', background: 'white', fontSize: '0.875rem' }}
          >
            <option value="ALL">{t.myEbooks.tabs.all}</option>
            <option value="PUBLISHED">{t.myEbooks.tabs.published}</option>
            <option value="PENDING">{t.myEbooks.tabs.pending}</option>
            <option value="DRAFT">{t.myEbooks.tabs.draft}</option>
          </select>
        </div>
        <div className="pub-view-toggle" style={{ display: 'flex', gap: '4px', background: '#F4F3F0', padding: '4px', borderRadius: '8px' }}>
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
          <div className="ebook-grid" style={{ padding: '0 24px 24px' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="ebook-card skeleton-card" style={{ padding: '12px', border: '1px solid #EAEAEA', borderRadius: '12px', background: 'white', display: 'flex', gap: '12px' }}>
                <div className="skeleton" style={{ width: '80px', height: '110px', borderRadius: '8px' }} />
                <div style={{ flex: 1, paddingTop: '4px' }}>
                  <div className="skeleton" style={{ height: 18, borderRadius: 4, width: '90%', marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 14, borderRadius: 4, width: '60%', marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 20, borderRadius: 4, width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
      ) : books.length === 0 ? (
          <div className="empty-state" style={{ padding: '48px 24px' }}>
            <div className="empty-state-icon">📚</div>
            <div className="empty-state-title">{t.myEbooks.empty}</div>
            <div className="empty-state-text">{lang === 'en' ? 'Upload your first ebook now' : 'Upload ebook pertama kamu sekarang'}</div>
            <Link href="/publisher/upload" className="btn btn-primary" style={{ marginTop: 16 }}>
              {t.nav.upload}
            </Link>
          </div>
      ) : filteredBooks.length === 0 ? (
          <div className="empty-state" style={{ padding: '48px 24px' }}>
            <div className="empty-state-title">{lang === 'en' ? 'No matching ebooks found' : 'Tidak ada hasil ditemukan'}</div>
            <div className="empty-state-text">{lang === 'en' ? 'Try adjusting your search or status filter.' : 'Coba sesuaikan pencarian atau filter status.'}</div>
          </div>
      ) : viewMode === 'list' ? (
        <>
          {/* DESKTOP TABLE VIEW */}
          <div className="pub-table-container" style={{ background: 'white', borderRadius: '12px', border: '1px solid #EAEAEA', margin: '0 24px 24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ background: '#F9F9F9', borderBottom: '1px solid #EAEAEA' }}>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#6B6B6B', fontWeight: 600, fontSize: '0.875rem' }}>{t.myEbooks.table.book}</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#6B6B6B', fontWeight: 600, fontSize: '0.875rem' }}>{t.myEbooks.table.status}</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#6B6B6B', fontWeight: 600, fontSize: '0.875rem' }}>{t.myEbooks.table.views}</th>
                    <th style={{ padding: '16px', textAlign: 'right', color: '#6B6B6B', fontWeight: 600, fontSize: '0.875rem' }}>{t.myEbooks.table.actions}</th>
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
                      <td style={{ padding: '16px' }}>{statusBadge(book.status, t.myEbooks)}</td>
                      <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <span style={{ fontSize: '0.813rem', color: '#6B6B6B', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{fontSize: '1rem'}}>👁</span> {book.totalViews ?? 0}</span>
                            <span style={{ fontSize: '0.813rem', color: '#6B6B6B', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{fontSize: '1rem'}}>⭐</span> {book.averageRating ? book.averageRating.toFixed(1) : '0.0'}</span>
                          </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <ActionMenu book={book} deletingId={deletingId} onDelete={handleDelete} onViewInLibrary={setPreviewBook} labels={t.myEbooks} />
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>

          {/* MOBILE VERTICAL LIST VIEW */}
          <div className="pub-mobile-list">
            {filteredBooks.map((book) => (
              <div key={book.id} style={{ background: '#FFFFFF', padding: '12px', borderRadius: '12px', border: '1px solid #EAEAEA', display: 'flex', gap: '12px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
                  <ActionMenu book={book} deletingId={deletingId} onDelete={handleDelete} onViewInLibrary={setPreviewBook} labels={t.myEbooks} />
                </div>
                <div style={{ width: '80px', height: '110px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', background: '#F4F3F0', border: '1px solid #EAEAEA' }}>
                  {book.coverImage ? <img src={book.coverImage} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '32px' }}>📖</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingTop: '4px', paddingRight: '24px' }}>
                  <div style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '1.05rem', marginBottom: '3px', lineHeight: 1.2 }}>{book.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#9B9B9B', marginBottom: '6px' }}>by {book.author}</div>
                  <div style={{ marginBottom: '8px' }}>{statusBadge(book.status, t.myEbooks)}</div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '4px', paddingTop: '8px', borderTop: '1px solid #F0F0F0' }}>
                    <span style={{ fontSize: '0.8rem', color: '#6B6B6B', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{fontSize: '1rem'}}>👁</span> {book.totalViews ?? 0}</span>
                    <span style={{ fontSize: '0.8rem', color: '#6B6B6B', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{fontSize: '1rem'}}>⭐</span> {book.averageRating ? book.averageRating.toFixed(1) : '0.0'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* GRID VIEW (UNIVERSAL) */
        <div className="ebook-grid" style={{ padding: '0 24px 24px' }}>
          {filteredBooks.map(book => (
            <div key={book.id} className="ebook-card" style={{ position: 'relative', overflow: 'visible' }}>
              <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
                <ActionMenu book={book} deletingId={deletingId} onDelete={handleDelete} onViewInLibrary={setPreviewBook} labels={t.myEbooks} />
              </div>
              {book.coverImage ? (
                <img src={book.coverImage} alt={book.title} className="ebook-card-cover" style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }} />
              ) : (
                <div className="ebook-card-cover-placeholder" style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>📖</div>
              )}
              <div className="ebook-card-body">
                <div className="ebook-card-title" style={{ paddingRight: 24 }}>{book.title}</div>
                <div className="ebook-card-author">by {book.author}</div>
                <div style={{ marginTop: 8 }}>{statusBadge(book.status, t.myEbooks)}</div>
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

      {/* OVERLAY PREVIEW PENGUNJUNG */}
      {previewBook && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', animation: 'fadeIn 0.2s ease-out'
        }}>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUpModal { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            .preview-modal {
              background: #FAFAF8; width: 100%; max-width: 900px;
              max-height: 90vh; border-radius: 12px; overflow-y: auto;
              position: relative; animation: slideUpModal 0.3s ease-out;
              box-shadow: 0 24px 48px rgba(0,0,0,0.2);
              color: #1A1A1A; font-family: 'Inter', system-ui, sans-serif;
            }
            .preview-close {
              position: absolute; top: 16px; right: 16px; z-index: 10;
              background: white; border: none; width: 36px; height: 36px;
              border-radius: 50%; display: flex; align-items: center; justify-content: center;
              cursor: pointer; font-size: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              transition: transform 0.2s;
            }
            .preview-close:hover { transform: scale(1.1); }
            
            .prev-hero { display: grid; grid-template-columns: 240px 1fr; gap: 48px; padding: 48px; }
            .prev-cover { width: 100%; aspect-ratio: 2/3; object-fit: cover; border-radius: 4px; box-shadow: 0 16px 32px rgba(0,0,0,0.15); }
            .prev-no-cover { width: 100%; aspect-ratio: 2/3; background: #EBEBEB; display: flex; align-items: center; justify-content: center; font-size: 40px; border-radius: 4px; }
            .prev-title { font-size: 2rem; font-weight: 800; line-height: 1.1; margin-bottom: 8px; letter-spacing: -0.5px; }
            .prev-author { font-size: 1.05rem; color: #666; margin-bottom: 24px; }
            .prev-meta { font-family: monospace; font-size: 0.85rem; margin-bottom: 24px; display: flex; gap: 16px; }
            .prev-stats { display: flex; gap: 24px; font-size: 0.9rem; font-weight: 600; margin-bottom: 32px; }
            
            .prev-split { display: grid; grid-template-columns: 1fr 250px; gap: 48px; padding: 0 48px 48px; }
            .prev-section-title { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 24px; }
            .prev-desc { font-size: 0.95rem; line-height: 1.8; color: #333; white-space: pre-line; }
            
            .prev-info-group { margin-bottom: 20px; }
            .prev-info-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 6px; }
            .prev-info-value { font-size: 0.9rem; font-weight: 500; }
            
            .prev-divider { height: 1px; background: rgba(0,0,0,0.1); margin: 0 48px 48px; }

            @media (max-width: 768px) {
              .prev-hero { grid-template-columns: 1fr; gap: 24px; padding: 32px 24px; text-align: center; }
              .prev-cover { max-width: 160px; margin: 0 auto; }
              .prev-meta, .prev-stats { justify-content: center; }
              .prev-split { grid-template-columns: 1fr; gap: 32px; padding: 0 24px 32px; text-align: left; }
              .prev-divider { margin: 0 24px 32px; }
            }
          `}</style>
          <div className="preview-modal">
            <button className="preview-close" onClick={() => setPreviewBook(null)}>✕</button>
            
            <div className="prev-hero">
              <div>
                {previewBook.coverImage ? (
                  <img src={previewBook.coverImage} alt={previewBook.title} className="prev-cover" />
                ) : (
                  <div className="prev-no-cover">📖</div>
                )}
              </div>
              <div>
                <div style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '1px', marginBottom: '16px' }}>
                  PREVIEW PENGUNJUNG
                </div>
                <h1 className="prev-title">{previewBook.title}</h1>
                <div className="prev-author">{previewBook.author}</div>
                <div className="prev-meta">
                  {previewBook.categoryName && <span>{previewBook.categoryName}</span>}
                  {previewBook.categoryName && <span>•</span>}
                  <span>Format PDF</span>
                </div>
                <div className="prev-stats">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '1.1rem' }}>★</span>
                    <span>{previewBook.averageRating ? previewBook.averageRating.toFixed(1) : '0.0'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '1.1rem' }}>👁</span>
                    <span>{previewBook.totalViews ?? 0} pembaca</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="prev-divider" />
            
            <div className="prev-split">
              <div>
                <div className="prev-section-title">TENTANG BUKU</div>
                <p className="prev-desc">{previewBook.description || 'Deskripsi belum tersedia untuk buku ini.'}</p>
              </div>
              <div>
                <div className="prev-section-title">INFORMASI</div>
                <div className="prev-info-group">
                  <div className="prev-info-label">Penulis</div>
                  <div className="prev-info-value">{previewBook.author}</div>
                </div>
                <div className="prev-info-group">
                  <div className="prev-info-label">Tanggal Rilis</div>
                  <div className="prev-info-value">{new Date(previewBook.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
                <div className="prev-info-group">
                  <div className="prev-info-label">Status</div>
                  <div className="prev-info-value">{statusBadge(previewBook.status, t.myEbooks)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}