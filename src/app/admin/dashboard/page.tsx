'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Download, HardDrive, Library, Users, AlertCircle, ArrowRight, UserCog, FileClock, CheckCircle2, TrendingUp
} from 'lucide-react';

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
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('/api/admin/stats', { headers })
      .then(r => r.json())
      .then(j => {
        if (j.success && j.data) {
          setStats(j.data.stats || { totalBooks: 0, totalPublishers: 0, pendingReviews: 0, totalVisits: 0, totalStorage: 0 });
          setTopPublishers(j.data.topPublishers || []);
        }
      })
      .catch(err => console.error('Failed to fetch admin stats', err))
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
    { 
      label: 'Pending Reviews', 
      value: stats.pendingReviews, 
      icon: <AlertCircle size={20} className={stats.pendingReviews > 0 ? "text-amber-600" : "text-slate-600"} />, 
      sub: 'Ebook butuh approval',
      trendText: stats.pendingReviews > 0 ? `${stats.pendingReviews} Aksi diperlukan` : 'Semua aman',
      isAlert: stats.pendingReviews > 0,
      iconBg: stats.pendingReviews > 0 ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'
    },
    { 
      label: 'Total Ebooks', 
      value: stats.totalBooks, 
      icon: <Library size={20} className="text-blue-600" />, 
      sub: 'Seluruh sistem',
      trendText: '+12% bulan ini',
      trendPositive: true,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100'
    },
    { 
      label: 'Publishers', 
      value: stats.totalPublishers, 
      icon: <Users size={20} className="text-emerald-600" />, 
      sub: 'Penerbit terdaftar',
      trendText: '+4 akun baru',
      trendPositive: true,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    },
    { 
      label: 'Storage Used', 
      value: formatBytes(stats.totalStorage || 0), 
      icon: <HardDrive size={20} className="text-purple-600" />, 
      sub: 'File PDF & Cover',
      trendText: 'Kapasitas stabil',
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100'
    },
  ];

  const handleExport = (type: 'books' | 'publishers') => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    fetch(`/api/admin/export?type=${type}`, { headers })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    })
    .catch(err => console.error('Export failed', err));
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '12px 0 48px' }}>
      
      {/* PAGE HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 4px' }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0, fontWeight: 500 }}>
            Ringkasan metrik sistem dan statistik operasional platform
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={() => handleExport('books')} 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              color: '#334155',
              borderRadius: '10px',
              fontSize: '0.813rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease'
            }}
          >
            <Download size={15} strokeWidth={2.5} />
            Export Books
          </button>
          
          <button 
            onClick={() => handleExport('publishers')} 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              background: '#0F172A',
              border: '1px solid #0F172A',
              color: '#FFFFFF',
              borderRadius: '10px',
              fontSize: '0.813rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.18)',
              transition: 'all 0.15s ease'
            }}
          >
            <Download size={15} strokeWidth={2.5} />
            Export Publishers
          </button>
        </div>
      </div>

      {/* STAT CARDS ROW (2x2 on mobile, 4 columns on desktop) */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ background: '#FFFFFF', borderRadius: '14px', padding: '14px', border: '1px solid #F1F5F9', minHeight: '90px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="skeleton" style={{ width: 28, height: 28, borderRadius: 6 }} />
              <div className="skeleton" style={{ width: 50, height: 20, borderRadius: 4 }} />
              <div className="skeleton" style={{ width: 80, height: 10, borderRadius: 4 }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
          {statCards.map((card, idx) => (
            <div 
              key={idx} 
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '14px 16px',
                border: card.isAlert ? '1px solid #FECDD3' : '1px solid #E2E8F0',
                boxShadow: card.isAlert ? '0 4px 12px rgba(225, 29, 72, 0.05)' : '0 2px 8px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '10px',
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Card Top Row: Label & Icon */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {card.label}
                </span>
                
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid',
                  background: card.isAlert ? '#FFF1F2' : '#F8FAFC',
                  borderColor: card.isAlert ? '#FFE4E6' : '#E2E8F0',
                  flexShrink: 0
                }}>
                  {card.icon}
                </div>
              </div>

              {/* Card Middle Row: Value */}
              <div>
                <div style={{
                  fontSize: '1.625rem',
                  fontWeight: 900,
                  color: card.isAlert ? '#E11D48' : '#0F172A',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em'
                }}>
                  {card.value}
                </div>
              </div>

              {/* Card Bottom Row: Dynamic Status / Subtitle */}
              <div style={{
                paddingTop: '8px',
                borderTop: '1px solid #F8FAFC',
                fontSize: '0.688rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{
                  fontWeight: 700,
                  color: card.isAlert ? '#E11D48' : (card.trendPositive ? '#059669' : '#64748B'),
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {card.trendPositive && <TrendingUp size={12} />}
                  {card.trendText}
                </span>

                <span style={{ color: '#94A3B8', fontWeight: 500, fontSize: '0.625rem' }} className="hidden sm:inline">
                  {card.sub}
                </span>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* TWO COLUMNS: TOP PUBLISHERS & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1.2fr] gap-6 items-start">
        
        {/* LEFT COLUMN: TOP PUBLISHERS TABLE */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
          overflow: 'hidden'
        }}>
          {/* Header Table */}
          <div style={{
            padding: '18px 24px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>Top Publishers</span>
              <span style={{
                fontSize: '0.688rem',
                fontWeight: 700,
                background: '#F1F5F9',
                color: '#475569',
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                {topPublishers.length} Mitra
              </span>
            </div>

            <Link 
              href="/admin/publishers" 
              style={{
                fontSize: '0.813rem',
                fontWeight: 700,
                color: '#2563EB',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Lihat Semua &rarr;
            </Link>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                  <th style={{ padding: '12px 24px', fontSize: '0.688rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Publisher Name
                  </th>
                  <th style={{ padding: '12px 24px', fontSize: '0.688rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>
                    Total Ebooks
                  </th>
                </tr>
              </thead>
              <tbody>
                {topPublishers.map((pub, index) => (
                  <tr 
                    key={pub.id} 
                    style={{
                      borderBottom: index === topPublishers.length - 1 ? 'none' : '1px solid #F8FAFC',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '14px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
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
                          {pub.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E293B' }}>
                          {pub.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
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
                  </tr>
                ))}

                {topPublishers.length === 0 && !loading && (
                  <tr>
                    <td colSpan={2} style={{ textAlign: 'center', padding: '36px', color: '#94A3B8', fontSize: '0.875rem' }}>
                      Belum ada data publisher terdaftar
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: QUICK ACTIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
            <span style={{ fontSize: '0.813rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Quick Actions
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Aksi Cepat</span>
          </div>
          
          {/* Action 1: Review Pending Ebooks */}
          <Link 
            href="/admin/books" 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              background: '#FFFFFF',
              padding: '18px 20px',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#EEF2FF',
              color: '#4F46E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <FileClock size={22} />
            </div>
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.938rem', fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>
                Review Pending Ebooks
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Tinjau dan kurasi ebook baru yang diunggah
              </div>
            </div>

            <ArrowRight size={16} color="#94A3B8" />
          </Link>

          {/* Action 2: Manage Publishers */}
          <Link 
            href="/admin/publishers" 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              background: '#FFFFFF',
              padding: '18px 20px',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <UserCog size={22} />
            </div>
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.938rem', fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>
                Manage Publishers
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Kelola hak akses dan verifikasi penerbit
              </div>
            </div>

            <ArrowRight size={16} color="#94A3B8" />
          </Link>

        </div>

      </div>

    </div>
  );
}
