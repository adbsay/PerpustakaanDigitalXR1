'use client';

import { useState, useEffect } from 'react';

interface Report {
  id: string;
  bookId: string;
  reason: string;
  status: 'OPEN' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
  book: { id: string; title: string; publisher: { name: string } };
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    const token = localStorage.getItem('admin_token');
    const res = await fetch('/api/admin/reports', { headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json();
    if (json.success) setReports(json.data);
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, []);

  const handleUpdate = async (id: string, status: string) => {
    const token = localStorage.getItem('admin_token');
    await fetch('/api/admin/reports', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, status })
    });
    fetchReports();
  };

  const getStatusBadge = (status: string) => {
    if (status === 'OPEN') return <span className="badge badge-pending">OPEN</span>;
    if (status === 'RESOLVED') return <span className="badge badge-published">RESOLVED</span>;
    return <span className="badge badge-banned">REJECTED</span>;
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Review Reports</h1>
        <p className="page-subtitle">Manage user complaints and flagging</p>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Book</th>
              <th>Publisher</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : reports.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>No reports found</td></tr>
            ) : reports.map(r => (
              <tr key={r.id}>
                <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                <td style={{ fontWeight: 500 }}>{r.book.title}</td>
                <td>{r.book.publisher.name}</td>
                <td style={{ color: '#FF3B30' }}>{r.reason}</td>
                <td>{getStatusBadge(r.status)}</td>
                <td>
                  {r.status === 'OPEN' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleUpdate(r.id, 'RESOLVED')}>Resolve</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleUpdate(r.id, 'REJECTED')}>Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
