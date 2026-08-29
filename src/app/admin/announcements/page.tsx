'use client';

import { useState, useEffect } from 'react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', content: '' });

  const fetchAnnouncements = async () => {
    const token = localStorage.getItem('admin_token');
    const res = await fetch('/api/admin/announcements', { headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json();
    if (json.success) setAnnouncements(json.data);
    setLoading(false);
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    const token = localStorage.getItem('admin_token');
    const res = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
    });
    const json = await res.json();
    if (json.success) {
      setForm({ title: '', content: '' });
      fetchAnnouncements();
    } else {
      alert(json.error);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete announcement "${title}"?`)) return;
    const token = localStorage.getItem('admin_token');
    await fetch(`/api/admin/announcements?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchAnnouncements();
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Broadcast Announcements</h1>
        <p className="page-subtitle">Send notifications to all publishers</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Content Snippet</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center' }}>Loading...</td></tr>
              ) : announcements.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center' }}>No announcements found</td></tr>
              ) : announcements.map(ann => (
                <tr key={ann.id}>
                  <td>{new Date(ann.createdAt).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 500 }}>{ann.title}</td>
                  <td style={{ color: '#6B6B6B' }}>
                    {ann.content.length > 50 ? ann.content.substring(0, 50) + '...' : ann.content}
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ann.id, ann.title)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>New Announcement</h3>
          <form onSubmit={handleAdd}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Maintenance Notice"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Message to publishers..."
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Broadcast</button>
          </form>
        </div>
      </div>
    </>
  );
}
