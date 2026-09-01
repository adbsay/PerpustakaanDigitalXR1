'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Trash2, Eye, Send, Users, UserCheck, UserX, AlertCircle, Plus, Calendar } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  target: 'ALL' | 'ACTIVE' | 'BANNED';
  createdAt: string;
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState<'ALL' | 'ACTIVE' | 'BANNED'>('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal States
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [viewModalData, setViewModalData] = useState<Announcement | null>(null);
  const [deleteModalData, setDeleteModalData] = useState<Announcement | null>(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('/api/admin/announcements', { headers });
      const json = await res.json();
      if (json.success && json.data) setAnnouncements(json.data);
    } catch (e) {
      console.error('Failed to fetch announcements', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleBroadcastClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setConfirmModalOpen(true);
  };

  const executeBroadcast = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers,
        body: JSON.stringify({ title, content, target })
      });
      const json = await res.json();
      if (json.success) {
        setTitle('');
        setContent('');
        setTarget('ALL');
        fetchAnnouncements();
        setConfirmModalOpen(false);
      } else {
        alert(json.error);
      }
    } catch (error) {
      alert('Gagal menyiarkan pesan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteModalData) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      await fetch(`/api/admin/announcements?id=${deleteModalData.id}`, {
        method: 'DELETE',
        headers
      });
      setDeleteModalData(null);
      fetchAnnouncements();
    } catch (error) {
      alert('Gagal menghapus pengumuman');
    }
  };

  const getTargetLabel = (t: string) => {
    switch (t) {
      case 'ALL': return 'Semua Penerbit';
      case 'ACTIVE': return 'Penerbit Aktif';
      case 'BANNED': return 'Penerbit Diblokir';
      default: return 'Semua Penerbit';
    }
  };

  const getTargetIcon = (t: string) => {
    switch (t) {
      case 'ALL': return <Users size={14} />;
      case 'ACTIVE': return <UserCheck size={14} />;
      case 'BANNED': return <UserX size={14} />;
      default: return <Users size={14} />;
    }
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '12px 0 48px' }}>
      
      {/* PAGE HEADER */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 4px' }}>
          System Announcements
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0, fontWeight: 500 }}>
          Kelola pesan siaran massal, pemeliharaan sistem, dan notifikasi untuk seluruh penerbit
        </p>
      </div>

      {/* TWO COLUMNS: TABLE (LEFT) & FORM (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1.2fr] gap-6 items-start">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: RIWAYAT PENGUMUMAN TABLE                    */}
        {/* ======================================================== */}
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
              <span style={{ fontSize: '0.938rem', fontWeight: 800, color: '#0F172A' }}>Riwayat Pengumuman</span>
              <span style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                background: '#E2E8F0',
                color: '#334155',
                padding: '2px 7px',
                borderRadius: '6px'
              }}>
                {announcements.length} Siaran
              </span>
            </div>
          </div>

          {/* DESKTOP TABLE (hidden on mobile) */}
          <div className="hidden lg:block" style={{ overflowX: 'auto', minHeight: '340px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
                  <th style={{ padding: '14px 20px', fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '50%' }}>
                    Judul & Cuplikan
                  </th>
                  <th style={{ padding: '14px 20px', fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '22%' }}>
                    Target
                  </th>
                  <th style={{ padding: '14px 20px', fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '16%' }}>
                    Tanggal
                  </th>
                  <th style={{ padding: '14px 20px', fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '12%', textAlign: 'right' }}>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '64px' }}>
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
                ) : announcements.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '64px 20px', color: '#94A3B8' }}>
                      <Megaphone size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>
                        Belum ada siaran pengumuman yang dikirimkan.
                      </p>
                    </td>
                  </tr>
                ) : (
                  announcements.map((ann, index) => (
                    <tr 
                      key={ann.id} 
                      style={{
                        borderBottom: index === announcements.length - 1 ? 'none' : '1px solid #F8FAFC',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      {/* Judul & Cuplikan */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: '#F1F5F9',
                            border: '1px solid #E2E8F0',
                            color: '#0F172A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: '2px'
                          }}>
                            <Megaphone size={16} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A', marginBottom: '2px', lineHeight: 1.3 }}>
                              {ann.title}
                            </div>
                            <div style={{
                              fontSize: '0.75rem',
                              color: '#64748B',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '260px'
                            }}>
                              {ann.content}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Target */}
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 10px',
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          color: '#334155',
                          fontSize: '0.688rem',
                          fontWeight: 800,
                          borderRadius: '6px',
                          textTransform: 'uppercase'
                        }}>
                          {getTargetIcon(ann.target || 'ALL')}
                          {getTargetLabel(ann.target || 'ALL')}
                        </span>
                      </td>

                      {/* Tanggal */}
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: '0.813rem', color: '#64748B', fontWeight: 600 }}>
                          {new Date(ann.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </td>

                      {/* Aksi (View & Delete) */}
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button 
                            onClick={() => setViewModalData(ann)}
                            title="Lihat Detail"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: '#FFFFFF',
                              border: '1px solid #E2E8F0',
                              color: '#475569',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Eye size={14} />
                          </button>
                          
                          <button 
                            onClick={() => setDeleteModalData(ann)}
                            title="Hapus Siaran"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: '#FFFFFF',
                              border: '1px solid #E2E8F0',
                              color: '#DC2626',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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
            ) : announcements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94A3B8' }}>
                <Megaphone size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                <p style={{ fontSize: '0.813rem', fontWeight: 600, margin: 0 }}>
                  Belum ada siaran pengumuman.
                </p>
              </div>
            ) : (
              announcements.map((ann) => (
                <div 
                  key={ann.id}
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
                  {/* Top Row: Icon + Title + Target */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: '#F1F5F9',
                        color: '#0F172A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Megaphone size={15} />
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                        {ann.title}
                      </div>
                    </div>

                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 7px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      color: '#334155',
                      fontSize: '0.625rem',
                      fontWeight: 800,
                      borderRadius: '5px',
                      textTransform: 'uppercase',
                      flexShrink: 0
                    }}>
                      {getTargetLabel(ann.target || 'ALL')}
                    </span>
                  </div>

                  {/* Content Preview */}
                  <p style={{ fontSize: '0.781rem', color: '#475569', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {ann.content}
                  </p>

                  {/* Bottom Row: Date & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid #F8FAFC' }}>
                    <span style={{ fontSize: '0.719rem', color: '#94A3B8', fontWeight: 600 }}>
                      {new Date(ann.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        onClick={() => setViewModalData(ann)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '7px',
                          background: '#F1F5F9',
                          border: '1px solid #E2E8F0',
                          color: '#334155',
                          fontSize: '0.719rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Eye size={12} />
                        Lihat
                      </button>
                      <button 
                        onClick={() => setDeleteModalData(ann)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '7px',
                          background: '#FEF2F2',
                          border: '1px solid #FECACA',
                          color: '#DC2626',
                          fontSize: '0.719rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Trash2 size={12} />
                        Hapus
                      </button>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>

        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: SIARAN BARU FORM CARD                      */}
        {/* ======================================================== */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.02)',
          padding: '24px',
          position: 'sticky',
          top: '24px'
        }}>
          {/* Form Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#0F172A',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Megaphone size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.063rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Siaran Baru
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
                Kirimkan pesan massal ke dashboard penerbit
              </p>
            </div>
          </div>
          
          <form onSubmit={handleBroadcastClick} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Target Penerima */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.813rem', fontWeight: 700, color: '#334155' }}>
                Target Penerima
              </label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value as 'ALL' | 'ACTIVE' | 'BANNED')}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  color: '#0F172A',
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="ALL">Semua Penerbit Terdaftar</option>
                <option value="ACTIVE">Hanya Penerbit Aktif</option>
                <option value="BANNED">Hanya Penerbit Diblokir</option>
              </select>
            </div>

            {/* Judul Pesan */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.813rem', fontWeight: 700, color: '#334155' }}>
                Judul Pengumuman <span style={{ color: '#E11D48' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Misal: Pemeliharaan Server Sistem..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  color: '#0F172A',
                  outline: 'none'
                }}
              />
            </div>
            
            {/* Isi Pengumuman */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.813rem', fontWeight: 700, color: '#334155' }}>
                Isi Pengumuman <span style={{ color: '#E11D48' }}>*</span>
              </label>
              <textarea
                rows={5}
                placeholder="Tuliskan isi pengumuman detail Anda di sini..."
                value={content}
                onChange={e => setContent(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  color: '#0F172A',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '120px'
                }}
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              style={{
                width: '100%',
                padding: '13px',
                background: '#0F172A',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.875rem',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '4px',
                transition: 'all 0.15s ease'
              }}
            >
              <Send size={15} />
              Broadcast Pengumuman
            </button>
          </form>
        </div>

      </div>

      {/* CONFIRMATION MODAL */}
      {confirmModalOpen && (
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
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width: '100%',
            maxWidth: '460px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: '#F1F5F9',
              color: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Megaphone size={24} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                Siarkan Pengumuman?
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0, lineHeight: 1.6 }}>
                Pesan ini akan disiarkan dan dapat dibaca oleh target <strong style={{ color: '#0F172A' }}>{getTargetLabel(target)}</strong>. Pastikan isi informasi sudah benar.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                onClick={() => setConfirmModalOpen(false)}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: '11px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>

              <button
                onClick={executeBroadcast}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: '11px',
                  background: '#0F172A',
                  border: 'none',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  borderRadius: '10px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {isSubmitting ? 'Mengirim...' : 'Ya, Siarkan Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW DETAIL MODAL */}
      {viewModalData && (
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
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width: '100%',
            maxWidth: '560px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '85vh'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #F1F5F9',
              background: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>
                  {viewModalData.title}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                  Target: {getTargetLabel(viewModalData.target || 'ALL')} • {new Date(viewModalData.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>

              <button
                onClick={() => setViewModalData(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '18px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto' }}>
              <p style={{ fontSize: '0.938rem', color: '#334155', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
                {viewModalData.content}
              </p>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #F1F5F9', background: '#F8FAFC', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setViewModalData(null)}
                style={{
                  padding: '9px 20px',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.813rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModalData && (
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
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width: '100%',
            maxWidth: '400px',
            padding: '28px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#FEF2F2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertCircle size={26} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>
                Hapus Pengumuman?
              </h3>
              <p style={{ fontSize: '0.813rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                Pesan &quot;{deleteModalData.title}&quot; akan dihapus permanen dari riwayat sistem.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '6px' }}>
              <button
                onClick={() => setDeleteModalData(null)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '0.813rem',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>
              <button
                onClick={executeDelete}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#DC2626',
                  border: 'none',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.813rem',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
