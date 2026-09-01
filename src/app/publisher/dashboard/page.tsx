'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { BookOpen, Clock, Eye, Star, Plus, Activity as ActivityIcon, Megaphone, ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';
import { usePublisherI18n } from '@/lib/publisherI18n';
import { AdminBroadcastBanner } from '@/components/AdminBroadcastBanner';

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
    return <div className="pub-stat-trend" style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '4px' }}>Belum ada data pembanding</div>;
  }
  const isUp = value >= 0;
  return (
    <div className="pub-stat-trend" style={{ fontSize: '0.75rem', fontWeight: 700, color: isUp ? '#059669' : '#DC2626', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
      {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />} {Math.abs(value)}% dari {label}
    </div>
  );
}

interface Book {
  id: string;
  title: string;
  author: string;
  views?: number;
  totalViews?: number;
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
  const { lang, t, formatDate } = usePublisherI18n();
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
      } catch {}
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
    setLoading(true);
    try {
      const [analyticsRes, booksRes, annRes] = await Promise.all([
        fetch('/api/publisher/analytics', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
        fetch('/api/publisher/books?limit=5', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
        fetch('/api/publisher/announcements', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
      ]);

      if (analyticsRes && analyticsRes.ok) {
        const aJson = await analyticsRes.json();
        if (aJson.success && aJson.data) {
          const s = aJson.data.stats || {};
          setStats({
            totalEbooks: s.totalEbooks ?? 0,
            pendingReviews: s.pendingReviews ?? 0,
            recentViews: s.recentViews ?? 0,
            averageRating: s.averageRating ?? 0,
          });
          if (aJson.data.topBooks) setTopBooks(aJson.data.topBooks);
          if (aJson.data.recentActivity) setRecentActivity(aJson.data.recentActivity);
          if (aJson.data.chartData) setChartData(aJson.data.chartData);
          if (aJson.data.trends) {
            setTrends({
              views: aJson.data.trends.views ?? null,
              ebooks: aJson.data.trends.books ?? null,
              rating: aJson.data.trends.rating ?? null,
            });
          }
        }
      }

      if (annRes && annRes.ok) {
        const annJson = await annRes.json();
        if (annJson.success && Array.isArray(annJson.data) && annJson.data.length > 0) {
          setAnnouncements(annJson.data);
        } else if (analyticsRes && analyticsRes.ok) {
          const aJson = await analyticsRes.clone().json().catch(() => null);
          if (aJson?.data?.announcements) setAnnouncements(aJson.data.announcements);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      
      {/* LIVE ADMIN BROADCAST BANNER (CONTROLLED BY GLOBAL NOTIFICATION CONTEXT) */}
      <AdminBroadcastBanner />

      <style>{`
        .pub-dashboard-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .pub-dashboard-2col-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }
        .pub-dashboard-activity-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: 20px;
        }

        /* --- MOBILE OPTIMIZATION --- */
        @media (max-width: 768px) {
          .pub-header-container {
            flex-direction: column !important;
            gap: 12px !important;
            margin-bottom: 16px !important;
          }
          .pub-header-title {
            font-size: 1.5rem !important;
            margin-bottom: 4px !important;
          }
          .pub-header-subtitle {
            font-size: 0.813rem !important;
            line-height: 1.4 !important;
          }
          
          .pub-dashboard-stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 10px !important;
            margin-bottom: 16px !important;
          }
          .pub-stat-card {
            padding: 12px !important;
            border-radius: 12px !important;
          }
          .pub-stat-value {
            font-size: 1.5rem !important;
            margin-bottom: 4px !important;
          }
          .pub-stat-icon-wrap {
            width: 26px !important;
            height: 26px !important;
            border-radius: 8px !important;
          }
          .pub-stat-icon-wrap svg {
            width: 14px;
            height: 14px;
          }
          .pub-stat-title {
            font-size: 0.625rem !important;
          }
          .pub-stat-trend {
            font-size: 0.625rem !important;
            margin-bottom: 2px !important;
          }
          .pub-stat-subtext {
            font-size: 0.625rem !important;
            line-height: 1.2 !important;
          }

          .pub-dashboard-2col-grid, .pub-dashboard-activity-grid {
            grid-template-columns: 1fr;
            gap: 12px !important;
            margin-bottom: 16px !important;
          }
          .pub-card-wrapper {
            padding: 16px !important;
            border-radius: 14px !important;
          }
          .pub-topbooks-table th, .pub-topbooks-table td {
            font-size: 0.75rem !important;
            padding: 8px 4px !important;
          }
        }
      `}</style>

      {/* TOP HEADER WITH QUICK ACTION */}
      <div className="pub-header-container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h1 className="pub-header-title" style={{
            fontSize: '1.75rem', 
            fontWeight: 800, 
            color: '#0F172A', 
            margin: '0 0 6px',
            letterSpacing: '-0.02em'
          }}>
            {t.dashboard.title}
          </h1>
          <p className="pub-header-subtitle" style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
            {userName ? `${t.dashboard.welcome}, ${userName}! ` : ''}{t.dashboard.subtitle}
          </p>
        </div>

        <Link
          href="/publisher/upload"
          className="btn-primary pub-header-btn"
          style={{
            padding: '10px 20px', 
            borderRadius: '10px', 
            fontSize: '0.875rem',
            textDecoration: 'none',
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px',
            boxShadow: '0 1px 3px rgba(37,99,235,0.2)'
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          {t.nav.upload}
        </Link>
      </div>

      {/* STATS 4-COLUMN GRID */}
      <div className="pub-dashboard-stats-grid">
        
        {/* Total Ebooks */}
        <div className="pub-stat-card" style={{
          background: '#FFFFFF',
          padding: '20px',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span className="pub-stat-title" style={{ fontSize: '0.813rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t.dashboard.stats.totalBooks}</span>
            <div className="pub-stat-icon-wrap" style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={18} />
            </div>
          </div>
          <div className="pub-stat-value" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F172A', lineHeight: 1, marginBottom: '8px' }}>
            {loading ? '—' : stats.totalEbooks}
          </div>
          <TrendBadge value={trends.ebooks} label={t.dashboard.stats.comparedToLast30Days} />
          <div className="pub-stat-subtext" style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{lang === 'en' ? 'All books uploaded by your publisher' : 'Semua buku yang telah Anda unggah'}</div>
        </div>

        {/* Review Tertunda */}
        <div className="pub-stat-card" style={{
          background: '#FFFFFF',
          padding: '20px',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span className="pub-stat-title" style={{ fontSize: '0.813rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t.dashboard.stats.pendingBooks}</span>
            <div className="pub-stat-icon-wrap" style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="pub-stat-value" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F172A', lineHeight: 1, marginBottom: '8px' }}>
            {loading ? '—' : stats.pendingReviews}
          </div>
          <div className="pub-stat-subtext" style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '4px' }}>
            {stats.pendingReviews === 0 ? (lang === 'en' ? '✓ All books approved' : '✓ Semua buku telah disetujui') : (lang === 'en' ? 'In admin moderation queue' : 'Dalam antrean moderasi admin')}
          </div>
          <div className="pub-stat-subtext" style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{lang === 'en' ? 'Awaiting quality verification' : 'Menunggu verifikasi standar kualitas'}</div>
        </div>

        {/* Tampilan Terbaru */}
        <div className="pub-stat-card" style={{
          background: '#FFFFFF',
          padding: '20px',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span className="pub-stat-title" style={{ fontSize: '0.813rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t.dashboard.stats.totalViews}</span>
            <div className="pub-stat-icon-wrap" style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Eye size={18} />
            </div>
          </div>
          <div className="pub-stat-value" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F172A', lineHeight: 1, marginBottom: '8px' }}>
            {loading ? '—' : (stats.recentViews ?? 0).toLocaleString()}
          </div>
          <TrendBadge value={trends.views} label={t.dashboard.stats.comparedToLast30Days} />
          <div className="pub-stat-subtext" style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{lang === 'en' ? 'Cumulative views across your catalog' : 'Total kumulatif views seluruh buku Anda'}</div>
        </div>

        {/* Rating Pembaca */}
        <div className="pub-stat-card" style={{
          background: '#FFFFFF',
          padding: '20px',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span className="pub-stat-title" style={{ fontSize: '0.813rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t.dashboard.stats.avgRating}</span>
            <div className="pub-stat-icon-wrap" style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEF9C3', color: '#CA8A04', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={18} />
            </div>
          </div>
          <div className="pub-stat-value" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F172A', lineHeight: 1, marginBottom: '8px' }}>
            {loading ? '—' : (stats.averageRating && stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0')}
          </div>
          <TrendBadge value={trends.rating} label={t.dashboard.stats.comparedToLast30Days} />
          <div className="pub-stat-subtext" style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{lang === 'en' ? 'Average reader reviews' : 'Rata-rata ulasan pembaca aktif'}</div>
        </div>

      </div>

      {/* CHARTS & TOP BOOKS ROW */}
      <div className="pub-dashboard-2col-grid">
        
        {/* Chart */}
        <div className="pub-card-wrapper" style={{ background: '#FFFFFF', padding: '24px', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{t.dashboard.chart.title}</h3>
            <select
              value={chartFilter}
              onChange={(e) => {
                setChartFilter(e.target.value);
                fetchChartData(e.target.value);
              }}
              style={{
                fontSize: '0.75rem', color: '#0F172A', background: '#F8FAFC', padding: '6px 12px', 
                borderRadius: '8px', fontWeight: 700, border: '1px solid #E2E8F0', outline: 'none', cursor: 'pointer'
              }}
            >
              <option value="7_days">{t.dashboard.chart.days7}</option>
              <option value="30_days">{t.dashboard.chart.days30}</option>
              <option value="6_months">{t.dashboard.chart.months6}</option>
              <option value="1_year">{t.dashboard.chart.year1}</option>
            </select>
          </div>
          {chartLoading ? (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '0.875rem' }}>
              {lang === 'en' ? 'Loading visualization data...' : 'Memuat data visualisasi...'}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashColorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  axisLine={false} tickLine={false} dy={10}
                  interval={chartFilter === '30_days' ? 4 : chartFilter === '7_days' ? 0 : 0}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 6px 18px rgba(0,0,0,0.06)', padding: '10px 14px', fontSize: '12px', fontWeight: 600 }}
                  cursor={{ stroke: '#CBD5E1', strokeWidth: 1, strokeDasharray: '4 4' }}
                  formatter={(val: any) => [`${val ?? 0} ${t.dashboard.topBooks.reads}`, t.dashboard.chart.viewsLabel]}
                />
                <Area type="monotone" name={t.dashboard.chart.viewsLabel} dataKey="views" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#dashColorViews)" activeDot={{ r: 5, strokeWidth: 0, fill: '#2563EB' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Books Table */}
        <div className="pub-card-wrapper" style={{ background: '#FFFFFF', padding: '24px', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{t.dashboard.topBooks.title}</h3>
            <Link href="/publisher/my-ebooks" className="btn-outline" style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {t.dashboard.topBooks.viewAll} <ArrowUpRight size={12} />
            </Link>
          </div>
          
          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table className="pub-topbooks-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <th style={{ textAlign: 'left', padding: '0 12px 10px 0', fontSize: '0.688rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t.myEbooks.table.book}</th>
                  <th style={{ textAlign: 'left', padding: '0 12px 10px 12px', fontSize: '0.688rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t.myEbooks.table.status}</th>
                  <th style={{ textAlign: 'right', padding: '0 0 10px 12px', fontSize: '0.688rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t.myEbooks.table.views}</th>
                </tr>
              </thead>
              <tbody>
                {topBooks.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ padding: '32px 12px', textAlign: 'center', color: '#94A3B8', fontSize: '0.813rem' }}>
                      {t.myEbooks.empty}
                    </td>
                  </tr>
                ) : (
                  topBooks.map((book, i) => (
                    <tr key={book.id} style={{ borderBottom: i < topBooks.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                      <td style={{ padding: '12px 12px 12px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '44px', background: '#F1F5F9', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                            {book.coverImage ? <img src={book.coverImage} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                          </div>
                          <div style={{ fontSize: '0.813rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>{book.title}</div>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '3px 8px', borderRadius: '6px', fontSize: '0.688rem', fontWeight: 800, textTransform: 'uppercase',
                          background: book.status === 'PUBLISHED' ? '#ECFDF5' : book.status === 'PENDING' ? '#FEF3C7' : '#FEF2F2',
                          color: book.status === 'PUBLISHED' ? '#059669' : book.status === 'PENDING' ? '#D97706' : '#DC2626',
                          border: `1px solid ${book.status === 'PUBLISHED' ? '#A7F3D0' : book.status === 'PENDING' ? '#FDE68A' : '#FECACA'}`
                        }}>
                          {book.status === 'PUBLISHED' ? t.myEbooks.status.published : book.status === 'PENDING' ? t.myEbooks.status.pending : t.myEbooks.status.banned}
                        </span>
                      </td>
                      <td style={{ padding: '12px 0 12px 12px', fontSize: '0.813rem', color: '#0F172A', fontWeight: 700, textAlign: 'right' }}>
                        {(book.views ?? book.totalViews ?? 0).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY & ANNOUNCEMENTS */}
      <div className="pub-dashboard-activity-grid">
        
        {/* Recent Activity */}
        <div className="pub-card-wrapper" style={{ background: '#FFFFFF', padding: '24px', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <ActivityIcon size={18} color="#2563EB" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{t.dashboard.activity.title}</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {recentActivity.length === 0 ? (
              <div style={{ color: '#94A3B8', fontSize: '0.813rem', padding: '16px 0' }}>{t.dashboard.activity.empty}</div>
            ) : (
              recentActivity.map((act) => (
                <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#F8FAFC', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.813rem', marginBottom: '2px' }}>{act.title}</div>
                    <div style={{ fontSize: '0.688rem', color: '#94A3B8' }}>{formatDate(act.createdAt)}</div>
                  </div>
                  <span style={{
                    padding: '3px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase',
                    background: act.status === 'PUBLISHED' ? '#ECFDF5' : act.status === 'PENDING' ? '#FEF3C7' : '#FEF2F2',
                    color: act.status === 'PUBLISHED' ? '#059669' : act.status === 'PENDING' ? '#D97706' : '#DC2626',
                    whiteSpace: 'nowrap'
                  }}>
                    {act.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Announcements */}
        <div className="pub-card-wrapper" style={{ background: '#FFFFFF', padding: '24px', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Megaphone size={18} color="#2563EB" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{t.dashboard.announcement.title}</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {announcements.length === 0 ? (
              <div style={{ color: '#94A3B8', fontSize: '0.813rem', padding: '16px 0' }}>{t.dashboard.announcement.empty}</div>
            ) : (
              announcements.map(ann => (
                <div key={ann.id} style={{ padding: '14px', background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ fontWeight: 800, color: '#1E40AF', fontSize: '0.813rem' }}>{ann.title}</div>
                    <div style={{ fontSize: '0.688rem', color: '#3B82F6', fontWeight: 600 }}>{formatDate(ann.createdAt)}</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#1E3A8A', lineHeight: 1.5 }}>
                    {ann.content}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}