'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface Stats {
  totalEbooks: number;
  pendingReviews: number;
  recentViews: number;
  averageRating: number;
}

interface Trends {
  views: number | null;
  ebooks: number | null;
  rating: number | null;
}

function TrendBadge({ value, label = '30 hari terakhir' }: { value: number | null; label?: string }) {
  if (value === null) {
    return <div style={{ fontSize: '0.75rem', color: '#9B9B9B', marginBottom: '4px' }}>Belum ada data pembanding</div>;
  }
  const isUp = value >= 0;
  return (
    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isUp ? '#2E7D32' : '#D32F2F', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
      {isUp ? '↑' : '↓'} {Math.abs(value)}% dari {label}
    </div>
  );
}

interface Book {
  id: string;
  title: string;
  author: string;
  views: number;
  status: string;
  coverImage?: string;
}

interface Activity {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface ChartPoint { label: string; views: number; }

const PERIOD_MAP: Record<string, string> = {
  '7_days': '7d',
  '30_days': '30d',
  '6_months': '6m',
  '1_year': '1y',
};

export default function PublisherDashboard() {
  const [stats, setStats] = useState<Stats>({ totalEbooks: 0, pendingReviews: 0, recentViews: 0, averageRating: 0 });
  const [topBooks, setTopBooks] = useState<Book[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [chartFilter, setChartFilter] = useState('6_months');
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [trends, setTrends] = useState<Trends>({ views: null, ebooks: null, rating: null });

  useEffect(() => {
    fetchData();
    const userStr = localStorage.getItem('publisher_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.name) setUserName(user.name);
      } catch (e) {}
    }
  }, []);

  const fetchChartData = useCallback(async (filter: string) => {
    const token = localStorage.getItem('publisher_token');
    if (!token) return;
    const period = PERIOD_MAP[filter] ?? '30d';
    setChartLoading(true);
    try {
      const res = await fetch(`/api/publisher/analytics?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && json.data.chartData) {
        setChartData(json.data.chartData);
      }
    } finally {
      setChartLoading(false);
    }
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('publisher_token');
    if (!token) return;

    try {
      const period = PERIOD_MAP[chartFilter] ?? '6m';
      const res = await fetch(`/api/publisher/analytics?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setStats(json.data.stats);
        setTopBooks(json.data.topBooks || []);
        setAnnouncements(json.data.announcements || []);
        setRecentActivity(json.data.recentActivity || []);
        if (json.data.chartData) setChartData(json.data.chartData);
        if (json.data.trends) setTrends(json.data.trends);
      }
    } finally {
      setLoading(false);
    }
  };

  const Card = ({ children }: { children: React.ReactNode }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
      <div 
        style={{ 
          background: 'white', padding: '24px', borderRadius: '16px', 
          border: '1px solid #EBEBEB', 
          boxShadow: isHovered ? '0 12px 24px rgba(0,0,0,0.06)' : '0 2px 8px rgba(0,0,0,0.02)', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          transition: 'all 0.3s ease',
          transform: isHovered ? 'translateY(-2px)' : 'none'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </div>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Hero Section */}
      <div style={{ 
        background: '#FFFFFF', 
        padding: '24px 0 24px 0', 
        borderBottom: '1px solid #EAEAEA',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        color: '#1A1A1A',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>Publisher Dashboard</h1>
          <p style={{ color: '#6B6B6B', margin: 0, fontSize: '0.938rem' }}>Selamat datang kembali, {userName || 'Publisher'}.</p>
        </div>
        <Link href="/publisher/upload" style={{
          background: '#1A1A1A', color: 'white', padding: '12px 24px', 
          borderRadius: '8px', fontWeight: 600, textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '6px 6px 0px 0px rgba(0,0,0,0.15)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0px 0px rgba(0,0,0,0.1)'; }}
        >
          <span>+</span> Unggah Ebook Baru
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '24px' }}>
        <Card>
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ background: '#F4F3F0', padding: '6px', borderRadius: '8px', fontSize: '14px' }}>📚</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6B6B6B' }}>Total Ebooks</div>
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '8px', lineHeight: 1 }}>
              {loading ? '—' : stats.totalEbooks}
            </div>
            <TrendBadge value={trends.ebooks} />
            <div style={{ fontSize: '0.75rem', color: '#9B9B9B' }}>Semua buku yang telah Anda unggah</div>
          </div>
        </Card>
        
        <Card>
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ background: '#FFF3E0', padding: '6px', borderRadius: '8px', fontSize: '14px' }}>⏳</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6B6B6B' }}>Review Tertunda</div>
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '8px', lineHeight: 1 }}>
              {loading ? '—' : stats.pendingReviews}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9B9B9B', marginBottom: '4px' }}>
              {stats.pendingReviews === 0 ? '✓ Semua buku telah ditinjau' : 'Buku menunggu persetujuan admin'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9B9B9B' }}>Buku dalam antrean persetujuan</div>
          </div>
        </Card>
        
        <Card>
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ background: '#E8F5E9', padding: '6px', borderRadius: '8px', fontSize: '14px' }}>👁</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6B6B6B' }}>Tampilan Terbaru</div>
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '8px', lineHeight: 1 }}>
              {loading ? '—' : stats.recentViews.toLocaleString()}
            </div>
            <TrendBadge value={trends.views} />
            <div style={{ fontSize: '0.75rem', color: '#9B9B9B' }}>Total kumulatif views buku Anda</div>
          </div>
        </Card>

        <Card>
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ background: '#FFF9C4', padding: '6px', borderRadius: '8px', fontSize: '14px' }}>⭐</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6B6B6B' }}>Rating Bintang</div>
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '8px', lineHeight: 1 }}>
              {loading ? '—' : (stats.averageRating ? stats.averageRating.toFixed(1) : '—')}
            </div>
            <TrendBadge value={trends.rating} />
            <div style={{ fontSize: '0.75rem', color: '#9B9B9B' }}>Rata-rata rating pembaca</div>
          </div>
        </Card>
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '24px' }}>
        {/* Chart */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #EBEBEB', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>Analitik Tampilan</h3>
            <select
              value={chartFilter}
              onChange={(e) => {
                setChartFilter(e.target.value);
                fetchChartData(e.target.value);
              }}
              style={{
                fontSize: '0.75rem', color: '#1A1A1A', background: '#F4F3F0', padding: '4px 10px', 
                borderRadius: '6px', fontWeight: 500, border: 'none', outline: 'none', cursor: 'pointer'
              }}
            >
              <option value="7_days">7 Hari</option>
              <option value="30_days">30 Hari</option>
              <option value="6_months">6 Bulan</option>
              <option value="1_year">Tahunan</option>
            </select>
          </div>
          {chartLoading ? (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9B9B9B', fontSize: '0.875rem' }}>
              Memuat grafik...
            </div>
          ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="dashColorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#C9A96E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: '#9B9B9B' }}
                axisLine={false} tickLine={false} dy={10}
                interval={chartFilter === '30_days' ? 4 : chartFilter === '7_days' ? 0 : 0}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9B9B9B' }} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #EBEBEB', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', padding: '12px', fontSize: '12px' }}
                cursor={{ stroke: '#EBEBEB', strokeWidth: 1, strokeDasharray: '4 4' }}
                formatter={(val: number) => [`${val} tayangan`, 'Tayangan']}
              />
              <Area type="monotone" name="Tayangan" dataKey="views" stroke="#C9A96E" strokeWidth={2.5} fillOpacity={1} fill="url(#dashColorViews)" activeDot={{ r: 5, strokeWidth: 0, fill: '#C9A96E' }} />
            </AreaChart>
          </ResponsiveContainer>
          )}
        </div>

        {/* Top books */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #EBEBEB', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>Performa Terbaik</h3>
            <Link href="/publisher/my-ebooks" style={{ fontSize: '0.813rem', color: '#1D2D44', fontWeight: 600, textDecoration: 'none' }}>Lihat Semua &rarr;</Link>
          </div>
          
          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #EBEBEB' }}>
                  <th style={{ textAlign: 'left', padding: '0 12px 12px 0', fontSize: '0.75rem', color: '#9B9B9B', fontWeight: 500 }}>Ebook</th>
                  <th style={{ textAlign: 'left', padding: '0 12px 12px 12px', fontSize: '0.75rem', color: '#9B9B9B', fontWeight: 500 }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '0 0 12px 12px', fontSize: '0.75rem', color: '#9B9B9B', fontWeight: 500 }}>Views</th>
                </tr>
              </thead>
              <tbody>
                {topBooks.length === 0 ? (
                  <>
                    <tr style={{ borderBottom: '1px solid #F4F3F0' }}>
                      <td style={{ padding: '16px 12px 16px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '56px', background: '#F4F3F0', borderRadius: '6px', overflow: 'hidden' }}>
                            <img src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=100&auto=format&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="cover" />
                          </div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A' }}>Buku Filosofi</div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ padding: '4px 10px', background: '#E8F5E9', color: '#2E7D32', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>Diterbitkan</span>
                      </td>
                      <td style={{ padding: '16px 0 16px 12px', fontSize: '0.875rem', color: '#1A1A1A', fontWeight: 600, textAlign: 'right' }}>10</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '16px 12px 16px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '56px', background: '#23395D', borderRadius: '6px', overflow: 'hidden' }}>
                            <img src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=100&auto=format&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="cover" />
                          </div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A' }}>Modern Macroeconomics</div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ padding: '4px 10px', background: '#FFF3E0', color: '#E65100', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>Menunggu</span>
                      </td>
                      <td style={{ padding: '16px 0 16px 12px', fontSize: '0.875rem', color: '#1A1A1A', fontWeight: 600, textAlign: 'right' }}>0</td>
                    </tr>
                  </>
                ) : (
                  topBooks.map((book, i) => (
                    <tr key={book.id} style={{ borderBottom: i < topBooks.length - 1 ? '1px solid #F4F3F0' : 'none' }}>
                      <td style={{ padding: '16px 12px 16px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '56px', background: '#F4F3F0', borderRadius: '6px', overflow: 'hidden' }}>
                            {book.coverImage ? <img src={book.coverImage} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                          </div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A' }}>{book.title}</div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                          background: book.status === 'PUBLISHED' ? '#E8F5E9' : book.status === 'PENDING' ? '#FFF3E0' : '#FFEBEE',
                          color: book.status === 'PUBLISHED' ? '#2E7D32' : book.status === 'PENDING' ? '#E65100' : '#C62828'
                        }}>
                          {book.status === 'PUBLISHED' ? 'Diterbitkan' : book.status === 'PENDING' ? 'Menunggu' : 'Banned'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 0 16px 12px', fontSize: '0.875rem', color: '#1A1A1A', fontWeight: 600, textAlign: 'right' }}>{book.views}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
        {/* Recent Activity */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #EBEBEB', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.2rem' }}>🕒</span>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>Log Aktivitas Terbaru</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '8px' }}>
            {recentActivity.length === 0 ? (
              <div style={{ color: '#9B9B9B', fontSize: '0.875rem' }}>Belum ada aktivitas.</div>
            ) : (
              recentActivity.map((act, index) => (
                <div key={act.id} style={{ display: 'flex', gap: '16px', position: 'relative', paddingBottom: index === recentActivity.length - 1 ? '0' : '20px' }}>
                  {/* Timeline Line & Node */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#C9A96E', zIndex: 1 }} />
                    {index !== recentActivity.length - 1 && (
                      <div style={{ width: '2px', flex: 1, background: '#F0F0F0', marginTop: '4px', marginBottom: '-4px' }} />
                    )}
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '-2px' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.875rem', marginBottom: '4px' }}>{act.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9B9B9B' }}>{new Date(act.createdAt).toLocaleString()}</div>
                    </div>
                    <span style={{
                      padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                      background: act.status === 'PUBLISHED' ? '#E8F5E9' : act.status === 'PENDING' ? '#FFF3E0' : '#FFEBEE',
                      color: act.status === 'PUBLISHED' ? '#2E7D32' : act.status === 'PENDING' ? '#E65100' : '#C62828',
                      whiteSpace: 'nowrap'
                    }}>
                      {act.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Announcements */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #EBEBEB', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.2rem' }}>📢</span>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>Pengumuman dari Admin</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {announcements.length === 0 ? (
              <div style={{ color: '#9B9B9B', fontSize: '0.875rem' }}>Belum ada pengumuman.</div>
            ) : (
              announcements.map(ann => (
                <div key={ann.id} style={{ padding: '16px', background: '#FFF9C4', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '20px', paddingTop: '2px' }}>📣</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ fontWeight: 700, color: '#827717', fontSize: '0.875rem' }}>{ann.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9E9D24' }}>{new Date(ann.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div style={{ fontSize: '0.813rem', color: '#827717', lineHeight: 1.5 }}>
                      {ann.content}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '48px', color: '#9B9B9B', fontSize: '0.813rem' }}>
        Copyright © 2026. Narrative Ebooks, Inc.
      </div>
    </div>
  );
}
