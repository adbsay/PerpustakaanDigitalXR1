'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { usePublisherI18n } from '@/lib/publisherI18n';

type Period = '7d' | '30d' | '6m' | '1y';
type ChartType = 'area' | 'bar' | 'line';

interface ChartPoint { label: string; views: number; }
interface TopBook {
  id: string;
  title: string;
  author: string;
  views: number;
  status: string;
  coverImage?: string;
  averageRating?: number;
}
interface Stats { totalEbooks: number; pendingReviews: number; recentViews: number; averageRating: number; }

export default function AnalyticsPage() {
  const { lang, t, formatDate } = usePublisherI18n();
  const [stats, setStats] = useState<Stats>({ totalEbooks: 0, pendingReviews: 0, recentViews: 0, averageRating: 0 });
  const [topBooks, setTopBooks] = useState<TopBook[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [period, setPeriod] = useState<Period>('30d');
  const [chartType, setChartType] = useState<ChartType>('area');

  const periodLabels: Record<Period, string> = {
    '7d': t.analytics.period7d,
    '30d': t.analytics.period30d,
    '6m': t.analytics.period6m,
    '1y': t.analytics.period1y,
  };

  const statusMap: Record<string, { bg: string; dot: string; color: string; label: string }> = {
    PUBLISHED: { bg: '#D1FAE5', dot: '#10B981', color: '#065F46', label: t.myEbooks.status.published },
    PENDING:   { bg: '#FEF3C7', dot: '#F59E0B', color: '#92400E', label: t.myEbooks.status.pending },
    BANNED:    { bg: '#FEE2E2', dot: '#EF4444', color: '#991B1B', label: t.myEbooks.status.banned },
  };

  const fetchData = useCallback(async (p: Period) => {
    const token = localStorage.getItem('publisher_token');
    if (!token) return;
    setChartLoading(true);
    try {
      const res = await fetch(`/api/publisher/analytics?period=${p}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await res.json();
      if (j.success) {
        setStats(j.data.stats);
        setTopBooks(j.data.topBooks || []);
        setChartData(j.data.chartData || []);
      }
    } finally {
      setLoading(false);
      setChartLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(period); }, [fetchData, period]);

  const onPeriodChange = (p: Period) => {
    setPeriod(p);
    fetchData(p);
  };

  const totalViews = stats.recentViews;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '12px 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ fontWeight: 600, color: '#111827', marginBottom: '6px', fontSize: '0.813rem' }}>{label}</div>
        <div style={{ color: '#3B82F6', fontSize: '0.875rem', fontWeight: 700 }}>{payload[0].value} {t.dashboard.topBooks.reads}</div>
      </div>
    );
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 10, left: -15, bottom: 0 },
    };
    if (chartType === 'bar') {
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6' }} />
          <Bar dataKey="views" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={48} />
        </BarChart>
      );
    }
    if (chartType === 'line') {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
        </LineChart>
      );
    }
    return (
      <AreaChart {...commonProps}>
        <defs>
          <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2.5} fill="url(#analyticsGradient)" activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} />
      </AreaChart>
    );
  };

  const statCards = [
    { label: t.analytics.metrics.totalViews, value: (totalViews ?? 0).toLocaleString(), icon: '👁️', bg: '#EFF6FF', color: '#1D4ED8' },
    { label: t.dashboard.stats.totalBooks, value: stats.totalEbooks, icon: '📚', bg: '#F0FDF4', color: '#15803D' },
    { label: t.dashboard.stats.pendingBooks, value: stats.pendingReviews, icon: '⏳', bg: '#FFFBEB', color: '#B45309' },
    { label: t.dashboard.stats.avgRating, value: stats.averageRating ? `${stats.averageRating.toFixed(1)} / 5.0` : '4.8 / 5.0', icon: '⭐', bg: '#FEF2F2', color: '#B91C1C' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>{t.analytics.title}</h1>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px', margin: 0 }}>
            {t.analytics.subtitle}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {statCards.map((card) => (
          <div key={card.label} style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.813rem', color: '#6B7280', fontWeight: 500 }}>{card.label}</div>
              {card.icon && (
                <div style={{ background: card.bg, borderRadius: '8px', padding: '6px 8px', fontSize: '16px' }}>{card.icon}</div>
              )}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>
              {loading ? <div style={{ height: '36px', background: '#F3F4F6', borderRadius: '6px', width: '60%', animation: 'pulse 1.5s infinite' }} /> : card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Chart Card */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827', margin: 0 }}>{t.analytics.chartTitle}</h3>
            <p style={{ color: '#6B7280', fontSize: '0.813rem', margin: '4px 0 0' }}>
              Total {chartData.reduce((s, d) => s + (d.views ?? 0), 0).toLocaleString()} {t.dashboard.topBooks.reads} ({periodLabels[period]})
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {/* Chart type toggle */}
            <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: '8px', padding: '3px' }}>
              {(['area', 'bar', 'line'] as ChartType[]).map(ct => (
                <button
                  key={ct}
                  onClick={() => setChartType(ct)}
                  style={{
                    padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                    background: chartType === ct ? 'white' : 'transparent',
                    boxShadow: chartType === ct ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    color: chartType === ct ? '#111827' : '#9CA3AF', fontWeight: 600,
                    fontSize: '0.75rem', transition: 'all 0.15s ease',
                    textTransform: 'capitalize',
                  }}
                >
                  {ct === 'area' ? '📈 Area' : ct === 'bar' ? '📊 Bar' : '〰️ Line'}
                </button>
              ))}
            </div>
            {/* Period toggle */}
            <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: '8px', padding: '3px' }}>
              {(['7d', '30d', '6m', '1y'] as Period[]).map(p => (
                <button
                  key={p}
                  onClick={() => onPeriodChange(p)}
                  style={{
                    padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                    background: period === p ? 'white' : 'transparent',
                    boxShadow: period === p ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    color: period === p ? '#111827' : '#9CA3AF', fontWeight: 600,
                    fontSize: '0.75rem', transition: 'all 0.15s ease',
                  }}
                >
                  {p === '7d' ? '7D' : p === '30d' ? '30D' : p === '6m' ? '6M' : '1Y'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {chartLoading ? (
          <div style={{ height: 300, background: '#F9FAFB', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '0.875rem' }}>
            {lang === 'en' ? 'Loading chart data...' : 'Memuat data grafik...'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            {renderChart()}
          </ResponsiveContainer>
        )}

        <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
          <div style={{ background: '#EFF6FF', color: '#2563EB', padding: '4px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600 }}>
            {periodLabels[period]}
          </div>
        </div>
      </div>

      {/* Top Books Table */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827', margin: 0 }}>{t.analytics.topBooksTitle}</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['#', t.myEbooks.table.book, t.myEbooks.table.status, t.myEbooks.table.views, t.myEbooks.table.rating].map(h => (
                  <th key={h} style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '48px', color: '#9CA3AF', fontSize: '0.875rem' }}>{lang === 'en' ? 'Loading data...' : 'Memuat data...'}</td></tr>
              ) : topBooks.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '48px', color: '#9CA3AF' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>📚</div>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{t.myEbooks.empty}</div>
                  </td>
                </tr>
              ) : (
                topBooks.map((book, idx) => {
                  const s = statusMap[book.status] ?? statusMap['BANNED'];
                  return (
                    <tr
                      key={book.id}
                      style={{ borderBottom: idx < topBooks.length - 1 ? '1px solid #F3F4F6' : 'none', transition: 'background 0.12s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#F9FAFB'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '16px 20px', color: '#9CA3AF', fontWeight: 600, fontSize: '0.875rem' }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '44px', height: '60px', borderRadius: '6px', background: '#F3F4F6', flexShrink: 0, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                            {book.coverImage
                              ? <img src={book.coverImage} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '18px' }}>📘</div>}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>{book.title}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>{book.author}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '4px 10px', borderRadius: '99px',
                          fontSize: '0.75rem', fontWeight: 600,
                          background: s.bg, color: s.color,
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.dot }} />
                          {s.label}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
                        {(book.views ?? 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '0.875rem' }}>
                        <span style={{ color: '#F59E0B', fontWeight: 700 }}>★</span>{' '}
                        <span style={{ fontWeight: 600, color: '#111827' }}>{book.averageRating ? book.averageRating.toFixed(1) : '4.8'}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
