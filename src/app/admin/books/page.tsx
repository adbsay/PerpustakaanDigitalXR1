'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, CheckCircle, XCircle, ShieldAlert, BookOpen, ExternalLink, X, Calendar, Filter } from 'lucide-react';
import Image from 'next/image';

interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
  coverImage: string | null;
  pdfFile: string | null;
  status: 'PENDING' | 'PUBLISHED' | 'BANNED';
  publisherName: string;
  createdAt: string;
}

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [reviewBook, setReviewBook] = useState<Book | null>(null);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    const params = new URLSearchParams();
    if (search.trim()) params.append('search', search.trim());
    if (statusFilter !== 'ALL') params.append('status', statusFilter);

    try {
      const res = await fetch(`/api/admin/books?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) setBooks(json.data);
    } catch (error) {
      console.error('Failed to fetch books', error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  // Debounced fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks();
    }, 350);
    return () => clearTimeout(timer);
  }, [fetchBooks]);

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'ban', title: string) => {
    const confirmMsg = action === 'approve' 
      ? `Setujui publikasi "${title}"?`
      : action === 'reject' 
      ? `Tolak "${title}"? E-book akan dikembalikan ke status revisi penerbit.`
      : `Ban "${title}"? E-book ini akan ditarik dari peredaran publik.`;
      
    if (!confirm(confirmMsg)) return;

    const token = localStorage.getItem('admin_token');
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/books/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (json.success) {
        setBooks(prev => prev.map(b => b.id === id ? { ...b, status: json.data.status } : b));
        setReviewBook(null);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            fontSize: '0.688rem',
            fontWeight: 800,
            background: '#ECFDF5',
            color: '#059669',
            border: '1px solid #A7F3D0',
            borderRadius: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
            Diterbitkan
          </span>
        );
      case 'PENDING':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            fontSize: '0.688rem',
            fontWeight: 800,
            background: '#FFFBEB',
            color: '#D97706',
            border: '1px solid #FDE68A',
            borderRadius: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }} />
            Menunggu Tinjauan
          </span>
        );
      case 'BANNED':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            fontSize: '0.688rem',
            fontWeight: 800,
            background: '#FEF2F2',
            color: '#DC2626',
            border: '1px solid #FECACA',
            borderRadius: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />
            Diblokir
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const tabs = [
    { id: 'ALL', label: 'Semua E-Book' },
    { id: 'PENDING', label: 'Menunggu Persetujuan' },
    { id: 'PUBLISHED', label: 'Diterbitkan' },
    { id: 'BANNED', label: 'Diblokir' }
  ];

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '12px 0 48px' }}>
      
      {/* PAGE HEADER */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 4px' }}>
          Manage E-Books
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0, fontWeight: 500 }}>
          Tinjau mutu, setujui kurasi, atau ban katalog e-book dari penerbit
        </p>
      </div>

      {/* TABLE CONTAINER CARD */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '18px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.02)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* FILTER & SEARCH HEADER */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #F1F5F9',
          background: '#F8FAFC',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {tabs.map(tab => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.813rem',
                    fontWeight: 700,
                    borderRadius: '10px',
                    border: isActive ? '1px solid #0F172A' : '1px solid #E2E8F0',
                    background: isActive ? '#0F172A' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#64748B',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 2px 6px rgba(15, 23, 42, 0.15)' : '0 1px 2px rgba(0,0,0,0.02)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <Search 
              size={16} 
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94A3B8',
                pointerEvents: 'none'
              }} 
            />
            <input 
              type="text" 
              placeholder="Cari judul, penulis, penerbit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 16px 9px 40px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                fontSize: '0.813rem',
                color: '#0F172A',
                outline: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
              }}
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 700
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div style={{ overflowX: 'auto', minHeight: '360px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
                <th style={{ padding: '14px 24px', fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '40%' }}>
                  Detail Buku
                </th>
                <th style={{ padding: '14px 24px', fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '20%' }}>
                  Penerbit
                </th>
                <th style={{ padding: '14px 24px', fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '15%' }}>
                  Status
                </th>
                <th style={{ padding: '14px 24px', fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '13%' }}>
                  Tanggal
                </th>
                <th style={{ padding: '14px 24px', fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '12%', textAlign: 'right' }}>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '64px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      border: '2px solid #0F172A',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                      margin: '0 auto'
                    }} />
                  </td>
                </tr>
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '64px 24px', color: '#94A3B8' }}>
                    <BookOpen size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Tidak ada e-book yang sesuai dengan filter.</p>
                  </td>
                </tr>
              ) : (
                books.map((book, index) => (
                  <tr 
                    key={book.id} 
                    style={{
                      borderBottom: index === books.length - 1 ? 'none' : '1px solid #F8FAFC',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {/* Detail Buku */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          position: 'relative',
                          width: '42px',
                          height: '56px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: '#F1F5F9',
                          border: '1px solid #E2E8F0',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                        }}>
                          {book.coverImage ? (
                            <Image src={book.coverImage} alt={book.title} fill style={{ objectFit: 'cover' }} />
                          ) : (
                            <BookOpen size={20} color="#94A3B8" />
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontSize: '0.875rem',
                            fontWeight: 800,
                            color: '#0F172A',
                            lineHeight: 1.35,
                            marginBottom: '3px'
                          }}>
                            {book.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
                            {book.author}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Penerbit */}
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#334155' }}>
                        {book.publisherName}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px 24px' }}>
                      {getStatusBadge(book.status)}
                    </td>

                    {/* Tanggal */}
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ fontSize: '0.813rem', color: '#64748B', fontWeight: 600 }}>
                        {new Date(book.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button
                        onClick={() => setReviewBook(book)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 14px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#0F172A',
                          background: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Eye size={14} />
                        Tinjau Konten
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* REVIEW MODAL */}
      {reviewBook && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width: '100%',
            maxWidth: '680px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#F8FAFC'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={20} color="#4F46E5" />
                <span style={{ fontSize: '1.063rem', fontWeight: 800, color: '#0F172A' }}>
                  Tinjauan Keamanan & Kualitas E-Book
                </span>
              </div>

              <button
                onClick={() => setReviewBook(null)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#E2E8F0',
                  border: 'none',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                {/* Book Cover */}
                <div style={{
                  width: '120px',
                  height: '168px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  position: 'relative',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {reviewBook.coverImage ? (
                    <Image src={reviewBook.coverImage} alt={reviewBook.title} fill style={{ objectFit: 'cover' }} />
                  ) : (
                    <BookOpen size={36} color="#94A3B8" />
                  )}
                </div>

                {/* Metadata */}
                <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: '0 0 4px', lineHeight: 1.3 }}>
                      {reviewBook.title}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0, fontWeight: 600 }}>
                      Penulis: <span style={{ color: '#0F172A' }}>{reviewBook.author}</span>
                    </p>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px',
                    background: '#F8FAFC',
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1px solid #F1F5F9'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.688rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '2px' }}>Penerbit</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A' }}>{reviewBook.publisherName}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.688rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Status Saat Ini</div>
                      <div>{getStatusBadge(reviewBook.status)}</div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.688rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Sinopsis / Deskripsi</div>
                    <p style={{ fontSize: '0.813rem', color: '#475569', lineHeight: 1.6, margin: 0, maxHeight: '100px', overflowY: 'auto' }}>
                      {reviewBook.description || <span style={{ fontStyle: 'italic', color: '#94A3B8' }}>Tidak ada deskripsi dari penerbit.</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* PDF Preview Link */}
              <div style={{ paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                <a
                  href={reviewBook.pdfFile || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px 20px',
                    background: '#0F172A',
                    color: '#FFFFFF',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.2)'
                  }}
                >
                  <ExternalLink size={16} />
                  Buka Dokumen PDF untuk Ditinjau
                </a>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div style={{
              padding: '16px 24px',
              background: '#F8FAFC',
              borderTop: '1px solid #F1F5F9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                Keputusan Kurasi
              </span>

              <div style={{ display: 'flex', gap: '10px' }}>
                {reviewBook.status !== 'PUBLISHED' && (
                  <button
                    onClick={() => handleAction(reviewBook.id, 'approve', reviewBook.title)}
                    disabled={actionLoading}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '9px 18px',
                      background: '#059669',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.813rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)'
                    }}
                  >
                    <CheckCircle size={15} />
                    Setujui Publikasi
                  </button>
                )}

                {reviewBook.status === 'PENDING' && (
                  <button
                    onClick={() => handleAction(reviewBook.id, 'reject', reviewBook.title)}
                    disabled={actionLoading}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '9px 16px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      color: '#475569',
                      borderRadius: '8px',
                      fontSize: '0.813rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <XCircle size={15} />
                    Tolak (Revisi)
                  </button>
                )}

                {reviewBook.status === 'PUBLISHED' && (
                  <button
                    onClick={() => handleAction(reviewBook.id, 'ban', reviewBook.title)}
                    disabled={actionLoading}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '9px 16px',
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      color: '#DC2626',
                      borderRadius: '8px',
                      fontSize: '0.813rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <ShieldAlert size={15} />
                    Ban Akses Buku
                  </button>
                )}

                {reviewBook.status === 'BANNED' && (
                  <button
                    onClick={() => handleAction(reviewBook.id, 'approve', reviewBook.title)}
                    disabled={actionLoading}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '9px 18px',
                      background: '#0F172A',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.813rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <CheckCircle size={15} />
                    Pulihkan Akses
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
