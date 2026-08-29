'use client';

import { useState, useEffect } from 'react';

interface Book {
  id: string;
  title: string;
  author: string;
  status: 'PENDING' | 'PUBLISHED' | 'BANNED';
  publisherName: string;
  createdAt: string;
}

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/books', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setBooks(json.data);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'ban', title: string) => {
    const confirmMsg = action === 'approve' 
      ? `Approve "${title}"? Ebook akan tayang ke publik.`
      : action === 'reject' 
      ? `Tolak "${title}"? Ebook akan dikembalikan ke publisher.`
      : `Banned "${title}"? Ebook akan ditarik dari publik.`;
      
    if (!confirm(confirmMsg)) return;

    const token = localStorage.getItem('admin_token');
    setActionId(id);
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
      }
    } finally {
      setActionId('');
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Manage Ebooks</h1>
        <p className="page-subtitle">Review, Approve, atau Banned Ebook</p>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Detail Ebook</th>
              <th>Publisher</th>
              <th>Status</th>
              <th>Tanggal</th>
              <th style={{ textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}>
                  <div className="loading-spinner" style={{ margin: '0 auto' }} />
                </td>
              </tr>
            ) : books.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#9B9B9B' }}>
                  Belum ada ebook di sistem
                </td>
              </tr>
            ) : (
              books.map(book => (
                <tr key={book.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{book.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9B9B9B' }}>{book.author}</div>
                  </td>
                  <td>{book.publisherName}</td>
                  <td>
                    <span className={`badge ${book.status === 'PUBLISHED' ? 'badge-published' : book.status === 'PENDING' ? 'badge-pending' : 'badge-banned'}`}>
                      {book.status === 'PENDING' ? 'Pending Review' : book.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.813rem' }}>
                    {new Date(book.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      {book.status === 'PENDING' && (
                        <>
                          <button
                            className="btn btn-approve"
                            onClick={() => handleAction(book.id, 'approve', book.title)}
                            disabled={actionId === book.id}
                          >
                            ✓ Approve
                          </button>
                          <button
                            className="btn btn-reject"
                            onClick={() => handleAction(book.id, 'reject', book.title)}
                            disabled={actionId === book.id}
                          >
                            ✕ Reject
                          </button>
                        </>
                      )}
                      {book.status === 'PUBLISHED' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleAction(book.id, 'ban', book.title)}
                          disabled={actionId === book.id}
                        >
                          Banned
                        </button>
                      )}
                      {book.status === 'BANNED' && (
                        <button
                          className="btn btn-approve"
                          onClick={() => handleAction(book.id, 'approve', book.title)}
                          disabled={actionId === book.id}
                        >
                          Un-ban
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
