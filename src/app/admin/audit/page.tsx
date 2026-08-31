'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Calendar, TerminalSquare, ShieldAlert, CheckCircle, Edit, Trash2, Globe, Laptop, Clock, ShieldCheck } from 'lucide-react';

interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  admin: {
    name: string;
    email: string;
  };
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Debounced search trigger
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    
    const params = new URLSearchParams();
    if (search.trim()) params.append('search', search.trim());
    if (actionFilter !== 'ALL') params.append('action', actionFilter);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    try {
      const res = await fetch(`/api/admin/audit?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) setLogs(json.data);
    } catch (error) {
      console.error('Failed to fetch audit logs', error);
    } finally {
      setLoading(false);
    }
  }, [search, actionFilter, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 350);
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  // Parsers & Formatters
  const parseActionString = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('id-ID', { month: 'short' });
    const year = date.getFullYear();
    const time = date.toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
    return `${day} ${month} ${year} • ${time} WIB`;
  };

  const getSemanticStyle = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('DELETE') || act.includes('REMOVE') || act.includes('BAN')) {
      return { 
        bg: '#FEF2F2', 
        color: '#DC2626',
        border: '#FECACA',
        icon: <Trash2 size={13} /> 
      };
    }
    if (act.includes('CREATE') || act.includes('ADD') || act.includes('NEW')) {
      return { 
        bg: '#ECFDF5', 
        color: '#059669',
        border: '#A7F3D0',
        icon: <CheckCircle size={13} /> 
      };
    }
    if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('MODIFY')) {
      return { 
        bg: '#EFF6FF', 
        color: '#2563EB',
        border: '#BFDBFE',
        icon: <Edit size={13} /> 
      };
    }
    if (act.includes('LOGIN') || act.includes('AUTH')) {
      return { 
        bg: '#F8FAFC', 
        color: '#475569',
        border: '#E2E8F0',
        icon: <ShieldAlert size={13} /> 
      };
    }
    return { 
      bg: '#F1F5F9', 
      color: '#334155',
      border: '#E2E8F0',
      icon: <TerminalSquare size={13} /> 
    };
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '12px 0 48px' }}>
      
      {/* PAGE HEADER */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 4px' }}>
          Forensic Audit Log
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0, fontWeight: 500 }}>
          Jejak digital seluruh aktivitas administratif, kurasi, dan perubahan keamanan sistem
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
        
        {/* ======================================================== */}
        {/* FILTER BAR (ALAT INVESTIGASI)                            */}
        {/* ======================================================== */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #F1F5F9',
          background: '#F8FAFC'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
            alignItems: 'center'
          }}>
            
            {/* Search Admin Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Search Admin
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                <input 
                  type="text" 
                  placeholder="Cari nama atau email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
              </div>
            </div>

            {/* Action Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Jenis Aksi
              </label>
              <div style={{ position: 'relative' }}>
                <Filter size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    fontSize: '0.813rem',
                    color: '#0F172A',
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                  }}
                >
                  <option value="ALL">Semua Aksi</option>
                  <option value="CREATE">Create (Pembuatan)</option>
                  <option value="UPDATE">Update (Perubahan)</option>
                  <option value="DELETE">Delete (Penghapusan)</option>
                  <option value="LOGIN">Login & Auth</option>
                </select>
              </div>
            </div>

            {/* Date Range - Start */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Dari Tanggal
              </label>
              <div style={{ position: 'relative' }}>
                <Calendar size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
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
              </div>
            </div>

            {/* Date Range - End */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Sampai Tanggal
              </label>
              <div style={{ position: 'relative' }}>
                <Calendar size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
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
              </div>
            </div>

          </div>
        </div>

        {/* ======================================================== */}
        {/* AUDIT LOGS TABLE                                         */}
        {/* ======================================================== */}
        <div style={{ overflowX: 'auto', minHeight: '400px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
                <th style={{ padding: '14px 20px', fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '20%' }}>
                  Timestamp
                </th>
                <th style={{ padding: '14px 20px', fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '22%' }}>
                  Administrator
                </th>
                <th style={{ padding: '14px 20px', fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '20%' }}>
                  Action
                </th>
                <th style={{ padding: '14px 20px', fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '38%' }}>
                  Forensic Details
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
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '64px 20px', color: '#94A3B8' }}>
                    <ShieldCheck size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>
                      Tidak ada rekaman log forensik yang cocok dengan filter.
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => {
                  const style = getSemanticStyle(log.action);
                  return (
                    <tr 
                      key={log.id} 
                      style={{
                        borderBottom: index === logs.length - 1 ? 'none' : '1px solid #F8FAFC',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      {/* Timestamp */}
                      <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '0.813rem', fontWeight: 700, color: '#1E293B' }}>
                          {formatTimestamp(log.createdAt)}
                        </span>
                      </td>

                      {/* Administrator */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                            {log.admin.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                              {log.admin.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                              {log.admin.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Action Badge */}
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          background: style.bg,
                          color: style.color,
                          border: `1px solid ${style.border}`,
                          borderRadius: '6px',
                          fontSize: '0.688rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          whiteSpace: 'nowrap'
                        }}>
                          {style.icon}
                          {parseActionString(log.action)}
                        </span>
                      </td>

                      {/* Forensic Details */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontSize: '0.813rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px', lineHeight: 1.4 }}>
                          {log.details || '-'}
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.688rem', color: '#94A3B8', fontWeight: 500 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }} title="IP Address">
                            <Globe size={13} />
                            <span>{log.ipAddress || '192.168.1.1 (Internal)'}</span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title="User Agent">
                            <Laptop size={13} />
                            <span>{log.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}</span>
                          </div>
                        </div>
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
