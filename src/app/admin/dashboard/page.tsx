'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AdminStats {
  totalBooks: number;
  totalPublishers: number;
  pendingReviews: number;
  totalVisits: number;
  totalStorage: number;
}

interface Publisher {
  id: string;
  name: string;
  totalBooks: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({ totalBooks: 0, totalPublishers: 0, pendingReviews: 0, totalVisits: 0, totalStorage: 0 });
  const [topPublishers, setTopPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(j => {
        if (j.success) {
          setStats(j.data.stats);
          setTopPublishers(j.data.topPublishers);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const statCards = [
    { label: 'Pending Reviews', value: stats.pendingReviews, icon: '⚠️', sub: 'Ebook butuh approval' },
    { label: 'Total Ebooks', value: stats.totalBooks, icon: '📚', sub: 'Seluruh sistem' },
    { label: 'Publishers', value: stats.totalPublishers, icon: '👥', sub: 'Penerbit terdaftar' },
    { label: 'Storage Used', value: formatBytes(stats.totalStorage || 0), icon: '💾', sub: 'File PDF & Cover' },
  ];

  const handleExport = (type: 'books' | 'publishers') => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    
    fetch(`/api/admin/export?type=${type}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  };

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">System Overview & Statistics</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => handleExport('books')} className="btn btn-ghost" style={{ background: 'white', border: '1px solid #EBEBEB' }}>
            📥 Export Books
          </button>
          <button onClick={() => handleExport('publishers')} className="btn btn-ghost" style={{ background: 'white', border: '1px solid #EBEBEB' }}>
            📥 Export Publishers
          </button>
        </div>
      </div>

      {loading ? (
        <div className="stats-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stat-card">
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 8 }} />
              <div className="skeleton" style={{ width: 60, height: 32, borderRadius: 4 }} />
              <div className="skeleton" style={{ width: 100, height: 14, borderRadius: 4 }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="stats-grid">
          {statCards.map(card => (
            <div key={card.label} className="stat-card" style={card.label === 'Pending Reviews' && card.value > 0 ? { border: '1px solid #FF9500' } : {}}>
              <div className="stat-card-icon">{card.icon}</div>
              <div className="stat-card-value">{card.value}</div>
              <div>
                <div className="stat-card-label">{card.label}</div>
                <div className="stat-card-sub">{card.sub}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="charts-row">
        <div className="table-container">
          <div className="table-header">
            <span className="table-title">Top Publishers</span>
            <Link href="/admin/publishers" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <table>
            <thead>
              <tr>
                <th>Publisher Name</th>
                <th>Total Ebooks</th>
              </tr>
            </thead>
            <tbody>
              {topPublishers.map(pub => (
                <tr key={pub.id}>
                  <td style={{ fontWeight: 500 }}>{pub.name}</td>
                  <td style={{ color: '#C9A96E', fontWeight: 600 }}>{pub.totalBooks}</td>
                </tr>
              ))}
              {topPublishers.length === 0 && !loading && (
                <tr>
                  <td colSpan={2} style={{ textAlign: 'center', padding: '24px' }}>Belum ada publisher</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: '0.938rem', fontWeight: 600 }}>Quick Actions</h3>
          <Link href="/admin/books" className="btn" style={{ background: '#F5F5F3', justifyContent: 'flex-start', padding: '16px' }}>
            <span style={{ fontSize: 24, marginRight: 12 }}>⏳</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, color: '#1A1A1A' }}>Review Pending Ebooks</div>
              <div style={{ fontSize: '0.75rem', color: '#6B6B6B' }}>Tinjau ebook baru yang diupload publisher</div>
            </div>
          </Link>
          <Link href="/admin/publishers" className="btn" style={{ background: '#F5F5F3', justifyContent: 'flex-start', padding: '16px' }}>
            <span style={{ fontSize: 24, marginRight: 12 }}>👥</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, color: '#1A1A1A' }}>Manage Publishers</div>
              <div style={{ fontSize: '0.75rem', color: '#6B6B6B' }}>Blokir atau izinkan akses publisher</div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
