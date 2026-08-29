'use client';

import { useState, useEffect } from 'react';

interface AuditLog {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
  admin: { name: string; email: string };
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    fetch('/api/admin/audit', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(json => {
        if (json.success) setLogs(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Audit Log</h1>
        <p className="page-subtitle">Track admin actions and system events</p>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Admin</th>
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center' }}>No audit logs found</td></tr>
            ) : logs.map(log => (
              <tr key={log.id}>
                <td style={{ color: '#9B9B9B' }}>{new Date(log.createdAt).toLocaleString()}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{log.admin.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B6B6B' }}>{log.admin.email}</div>
                </td>
                <td>
                  <span className="badge" style={{ background: '#F4F3F0', color: '#1A1A1A' }}>{log.action}</span>
                </td>
                <td style={{ color: '#6B6B6B' }}>{log.details || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
