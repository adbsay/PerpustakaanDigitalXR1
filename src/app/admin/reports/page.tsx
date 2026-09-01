'use client';

import { useState, useEffect } from 'react';
import { Flag, BookOpen, User, CheckCircle2, XCircle, Clock, ShieldAlert } from 'lucide-react';

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
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('/api/admin/reports', { headers });
      const json = await res.json();
      if (json.success && json.data) setReports(json.data);
    } catch (e) {
      console.error('Failed to fetch reports', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleUpdate = async (id: string, status: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      await fetch('/api/admin/reports', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ id, status })
      });
      fetchReports();
    } catch (e) {
      console.error('Failed to update report', e);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'OPEN') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          background: '#FFFBEB',
          color: '#D97706',
          border: '1px solid #FDE68A',
          borderRadius: '6px',
          fontSize: '0.688rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }} />
          OPEN
        </span>
      );
    }
    if (status === 'RESOLVED') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          background: '#ECFDF5',
          color: '#059669',
          border: '1px solid #A7F3D0',
          borderRadius: '6px',
          fontSize: '0.688rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
          RESOLVED
        </span>
      );
    }
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 8px',
        background: '#FEF2F2',
        color: '#DC2626',
        border: '1px solid #FECACA',
        borderRadius: '6px',
        fontSize: '0.688rem',
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.04em'
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />
        REJECTED
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '4px 0 40px' }}>
      
      {/* PAGE HEADER */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 2px' }}>
          Review Reports
        </h1>
        <p style={{ fontSize: '0.813rem', color: '#64748B', margin: 0, fontWeight: 500 }}>
          Kelola laporan keluhan pembaca, kurasi pelanggaran konten, dan flagging keamanan
        </p>
      </div>

      {/* CONTAINER CARD */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Header Bar */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid #F1F5F9',
          background: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.938rem', fontWeight: 800, color: '#0F172A' }}>Daftar Laporan</span>
            <span style={{
              fontSize: '0.625rem',
              fontWeight: 700,
              background: '#F1F5F9',
              color: '#475569',
              padding: '2px 7px',
              borderRadius: '6px'
            }}>
              {reports.length} Laporan
            </span>
          </div>
        </div>

        {/* DESKTOP TABLE VIEW (hidden on mobile) */}
        <div className="hidden lg:block" style={{ overflowX: 'auto', minHeight: '340px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
                <th style={{ padding: '14px 20px', fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '16%' }}>
                  Tanggal
                </th>
                <th style={{ padding: '14px 20px', fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '26%' }}>
                  Judul Ebook
                </th>
                <th style={{ padding: '14px 20px', fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '20%' }}>
                  Penerbit
                </th>
                <th style={{ padding: '14px 20px', fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '20%' }}>
                  Alasan Laporan
                </th>
                <th style={{ padding: '14px 20px', fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '10%' }}>
                  Status
                </th>
                <th style={{ padding: '14px 20px', fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '8%', textAlign: 'right' }}>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '64px' }}>
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
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '64px 20px', color: '#94A3B8' }}>
                    <Flag size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>
                      Belum ada laporan keluhan dari pengguna.
                    </p>
                  </td>
                </tr>
              ) : (
                reports.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '14px 20px', fontSize: '0.813rem', color: '#64748B', fontWeight: 600 }}>
                      {new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
                        {r.book?.title || 'Ebook tidak ditemukan'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '0.813rem', color: '#334155', fontWeight: 600 }}>
                      {r.book?.publisher?.name || '-'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: '0.813rem', color: '#DC2626', fontWeight: 600, background: '#FEF2F2', padding: '3px 8px', borderRadius: '6px', border: '1px solid #FECACA' }}>
                        {r.reason}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {getStatusBadge(r.status)}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      {r.status === 'OPEN' ? (
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => handleUpdate(r.id, 'RESOLVED')}
                            style={{
                              padding: '5px 10px',
                              background: '#ECFDF5',
                              border: '1px solid #A7F3D0',
                              color: '#059669',
                              borderRadius: '7px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => handleUpdate(r.id, 'REJECTED')}
                            style={{
                              padding: '5px 10px',
                              background: '#FEF2F2',
                              border: '1px solid #FECACA',
                              color: '#DC2626',
                              borderRadius: '7px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Selesai</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD LIST VIEW (block on < 1024px) */}
        <div className="block lg:hidden" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{
                width: '28px',
                height: '28px',
                border: '2px solid #0F172A',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto'
              }} />
            </div>
          ) : reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94A3B8' }}>
              <Flag size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <p style={{ fontSize: '0.813rem', fontWeight: 600, margin: 0 }}>
                Belum ada laporan keluhan.
              </p>
            </div>
          ) : (
            reports.map(r => (
              <div
                key={r.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  padding: '14px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                {/* Top Row: Date & Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>
                    <Clock size={12} color="#94A3B8" />
                    <span>{new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div>{getStatusBadge(r.status)}</div>
                </div>

                {/* Middle Row: Book title & Publisher */}
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.3, marginBottom: '3px' }}>
                    {r.book?.title || 'Ebook tidak ditemukan'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                    Penerbit: <span style={{ color: '#0F172A' }}>{r.book?.publisher?.name || '-'}</span>
                  </div>
                </div>

                {/* Reason */}
                <div style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.781rem',
                  color: '#DC2626',
                  fontWeight: 600
                }}>
                  Alasan: {r.reason}
                </div>

                {/* Actions on Mobile */}
                {r.status === 'OPEN' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '4px' }}>
                    <button
                      onClick={() => handleUpdate(r.id, 'RESOLVED')}
                      style={{
                        padding: '8px',
                        background: '#ECFDF5',
                        border: '1px solid #A7F3D0',
                        color: '#059669',
                        borderRadius: '8px',
                        fontSize: '0.781rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <CheckCircle2 size={14} />
                      Setujui (Resolve)
                    </button>
                    <button
                      onClick={() => handleUpdate(r.id, 'REJECTED')}
                      style={{
                        padding: '8px',
                        background: '#FEF2F2',
                        border: '1px solid #FECACA',
                        color: '#DC2626',
                        borderRadius: '8px',
                        fontSize: '0.781rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <XCircle size={14} />
                      Tolak (Reject)
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}
