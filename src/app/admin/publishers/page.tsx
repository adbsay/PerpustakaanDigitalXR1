'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Ban, ChevronLeft, ChevronRight, CheckCircle2, Users, Phone, Mail, ShieldAlert } from 'lucide-react';

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
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BANNED'>('ALL');

  // Modal State
  const [banModalUser, setBanModalUser] = useState<Publisher | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Filtered and Paginated Data
  const filteredPublishers = useMemo(() => {
    let filtered = publishers;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.email.toLowerCase().includes(q) ||
        (p.phone && p.phone.includes(q))
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    return filtered;
  }, [publishers, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredPublishers.length / itemsPerPage) || 1;
  const paginatedPublishers = filteredPublishers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleStatusUpdate = async () => {
    if (!banModalUser) return;
    
    const action = banModalUser.status === 'ACTIVE' ? 'ban' : 'unban';
    const token = localStorage.getItem('admin_token');
    
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/publishers/${banModalUser.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (json.success) {
        setPublishers(prev => prev.map(p => p.id === banModalUser.id ? { ...p, status: json.data.status } : p));
        setBanModalUser(null);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '12px 0 48px' }}>
      
      {/* PAGE HEADER */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 4px' }}>
          Manage Publishers
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0, fontWeight: 500 }}>
          Daftar seluruh penerbit terdaftar, verifikasi akun, dan kontrol hak akses publikasi
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
          {/* Left: Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.813rem', fontWeight: 800, color: '#64748B', marginRight: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Filter:
            </span>

            <button
              onClick={() => setStatusFilter('ALL')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.813rem',
                fontWeight: 700,
                border: statusFilter === 'ALL' ? '1px solid #0F172A' : '1px solid #E2E8F0',
                background: statusFilter === 'ALL' ? '#0F172A' : '#FFFFFF',
                color: statusFilter === 'ALL' ? '#FFFFFF' : '#64748B',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Semua ({publishers.length})
            </button>

            <button
              onClick={() => setStatusFilter('ACTIVE')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.813rem',
                fontWeight: 700,
                border: statusFilter === 'ACTIVE' ? '1px solid #059669' : '1px solid #E2E8F0',
                background: statusFilter === 'ACTIVE' ? '#ECFDF5' : '#FFFFFF',
                color: statusFilter === 'ACTIVE' ? '#059669' : '#64748B',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Aktif ({publishers.filter(p => p.status === 'ACTIVE').length})
            </button>

            <button
              onClick={() => setStatusFilter('BANNED')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.813rem',
                fontWeight: 700,
                border: statusFilter === 'BANNED' ? '1px solid #DC2626' : '1px solid #E2E8F0',
                background: statusFilter === 'BANNED' ? '#FEF2F2' : '#FFFFFF',
                color: statusFilter === 'BANNED' ? '#DC2626' : '#64748B',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Diblokir ({publishers.filter(p => p.status === 'BANNED').length})
            </button>
          </div>

          {/* Right: Search Box */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
            <Search 
              size={15} 
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94A3B8',
                pointerEvents: 'none'
              }} 
            />
            <input 
              type="text" 
              placeholder="Cari nama, email, telepon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                fontSize: '0.813rem',
                color: '#0F172A',
                outline: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
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
        <div style={{ overflowX: 'auto', minHeight: '380px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
                <th style={{ padding: '14px 20px', fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '32%' }}>
                  Nama Publisher
                </th>
                <th style={{ padding: '14px 20px', fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '25%' }}>
                  Email
                </th>
                <th style={{ padding: '14px 20px', fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '15%' }}>
                  Total Ebooks
                </th>
                <th style={{ padding: '14px 20px', fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '13%' }}>
                  Status
                </th>
                <th style={{ padding: '14px 20px', fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '15%', textAlign: 'right' }}>
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
              ) : paginatedPublishers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '64px 20px', color: '#94A3B8' }}>
                    <Users size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>
                      Tidak ada data penerbit yang cocok dengan kriteria filter.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedPublishers.map((pub, index) => (
                  <tr 
                    key={pub.id} 
                    style={{
                      borderBottom: index === paginatedPublishers.length - 1 ? 'none' : '1px solid #F8FAFC',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {/* Nama Publisher & No Telepon */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: '#0F172A',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          flexShrink: 0
                        }}>
                          {pub.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                            {pub.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={11} color="#94A3B8" />
                            {pub.phone || 'Tidak ada no telepon'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontSize: '0.813rem', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={13} color="#94A3B8" />
                        {pub.email}
                      </div>
                    </td>

                    {/* Total Ebooks */}
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 10px',
                        background: '#F1F5F9',
                        color: '#0F172A',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        borderRadius: '6px'
                      }}>
                        {pub.totalBooks} Ebook
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '14px 20px' }}>
                      {pub.status === 'ACTIVE' ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 10px',
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
                          Aktif
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 10px',
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
                          Diblokir
                        </span>
                      )}
                    </td>

                    {/* Direct Action Button (100% Reliable, Never Clipped) */}
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      {pub.status === 'ACTIVE' ? (
                        <button
                          onClick={() => setBanModalUser(pub)}
                          title="Blokir Akses Publisher"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            background: '#FFFFFF',
                            border: '1px solid #FECACA',
                            color: '#DC2626',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                          }}
                        >
                          <Ban size={13} />
                          Blokir Akses
                        </button>
                      ) : (
                        <button
                          onClick={() => setBanModalUser(pub)}
                          title="Pulihkan Akses Publisher"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            background: '#ECFDF5',
                            border: '1px solid #A7F3D0',
                            color: '#059669',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                          }}
                        >
                          <CheckCircle2 size={13} />
                          Pulihkan
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Count */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid #F1F5F9',
          background: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ fontSize: '0.813rem', color: '#64748B', fontWeight: 500 }}>
            Menampilkan <strong style={{ color: '#0F172A' }}>
              {filteredPublishers.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1}
            </strong> hingga <strong style={{ color: '#0F172A' }}>
              {Math.min(currentPage * itemsPerPage, filteredPublishers.length)}
            </strong> dari <strong style={{ color: '#0F172A' }}>{filteredPublishers.length}</strong> Penerbit
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* BAN / UNBAN CONFIRMATION MODAL */}
      {banModalUser && (
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
              borderRadius: '50%',
              background: banModalUser.status === 'ACTIVE' ? '#FEF2F2' : '#ECFDF5',
              color: banModalUser.status === 'ACTIVE' ? '#DC2626' : '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {banModalUser.status === 'ACTIVE' ? <Ban size={24} /> : <CheckCircle2 size={24} />}
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                {banModalUser.status === 'ACTIVE' ? 'Blokir Penerbit Ini?' : 'Pulihkan Akses Penerbit?'}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0, lineHeight: 1.6 }}>
                {banModalUser.status === 'ACTIVE' 
                  ? <>Anda akan menonaktifkan hak akses login penerbit <strong style={{ color: '#0F172A' }}>{banModalUser.name}</strong>. E-book mereka tidak dapat diedit selama masa penangguhan.</>
                  : <>Anda akan memulihkan kembali hak akses login dan operasional untuk penerbit <strong style={{ color: '#0F172A' }}>{banModalUser.name}</strong>.</>
                }
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button 
                onClick={() => setBanModalUser(null)} 
                disabled={isProcessing}
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
                onClick={handleStatusUpdate}
                disabled={isProcessing}
                style={{
                  flex: 1,
                  padding: '11px',
                  background: banModalUser.status === 'ACTIVE' ? '#DC2626' : '#059669',
                  border: 'none',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  borderRadius: '10px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer'
                }}
              >
                {isProcessing 
                  ? 'Memproses...' 
                  : (banModalUser.status === 'ACTIVE' ? 'Ya, Blokir Akses' : 'Ya, Pulihkan Akses')
                }
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
