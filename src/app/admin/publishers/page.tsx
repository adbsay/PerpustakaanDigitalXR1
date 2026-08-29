'use client';

import { useState, useEffect } from 'react';

interface Publisher {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: 'ACTIVE' | 'BANNED';
  totalBooks: number;
  createdAt: string;
}

export default function AdminPublishersPage() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');

  useEffect(() => {
    fetchPublishers();
  }, []);

  const fetchPublishers = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/publishers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setPublishers(json.data);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, currentStatus: string, name: string) => {
    const action = currentStatus === 'ACTIVE' ? 'ban' : 'unban';
    const confirmMsg = action === 'ban' 
      ? `Blokir publisher "${name}"? Mereka tidak akan bisa login.`
      : `Buka blokir publisher "${name}"?`;
      
    if (!confirm(confirmMsg)) return;

    const token = localStorage.getItem('admin_token');
    setActionId(id);
    try {
      const res = await fetch(`/api/admin/publishers/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (json.success) {
        setPublishers(prev => prev.map(p => p.id === id ? { ...p, status: json.data.status } : p));
      }
    } finally {
      setActionId('');
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Manage Publishers</h1>
        <p className="page-subtitle">Daftar semua penerbit yang terdaftar di sistem</p>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nama Publisher</th>
              <th>Email</th>
              <th>Status</th>
              <th>Total Ebooks</th>
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
            ) : publishers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#9B9B9B' }}>
                  Belum ada publisher terdaftar
                </td>
              </tr>
            ) : (
              publishers.map(pub => (
                <tr key={pub.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{pub.name}</div>
                    {pub.phone && <div style={{ fontSize: '0.75rem', color: '#9B9B9B' }}>{pub.phone}</div>}
                  </td>
                  <td>{pub.email}</td>
                  <td>
                    <span className={`badge ${pub.status === 'ACTIVE' ? 'badge-active' : 'badge-banned'}`}>
                      {pub.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{pub.totalBooks}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className={`btn btn-sm ${pub.status === 'ACTIVE' ? 'btn-danger' : 'btn-primary'}`}
                      onClick={() => handleStatusUpdate(pub.id, pub.status, pub.name)}
                      disabled={actionId === pub.id}
                    >
                      {actionId === pub.id ? '...' : pub.status === 'ACTIVE' ? 'Blokir (Ban)' : 'Buka Blokir'}
                    </button>
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
