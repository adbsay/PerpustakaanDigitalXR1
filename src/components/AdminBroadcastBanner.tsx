'use client';

import React from 'react';
import { AlertCircle, Megaphone, Info } from 'lucide-react';
import { useNotificationContext } from '@/context/NotificationContext';
import { usePublisherI18n } from '@/lib/publisherI18n';

export function AdminBroadcastBanner() {
  const { adminBroadcasts } = useNotificationContext();
  const { lang } = usePublisherI18n();

  // Conditional Rendering based on Global State
  if (!adminBroadcasts) {
    return null;
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
      border: '1px solid #FDE68A',
      borderRadius: '16px',
      padding: '16px 20px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '14px',
      boxShadow: '0 2px 6px rgba(217, 119, 6, 0.08)',
      animation: 'subtleFadeIn 0.2s ease-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: '#F59E0B',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)'
        }}>
          <Megaphone size={20} />
        </div>
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#92400E', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{lang === 'en' ? 'System Broadcast Notice' : 'Pengumuman Penting Administrator'}</span>
            <span style={{
              fontSize: '0.625rem',
              padding: '2px 8px',
              borderRadius: '99px',
              background: '#FEF3C7',
              color: '#B45309',
              border: '1px solid #FCD34D',
              fontWeight: 800,
              textTransform: 'uppercase'
            }}>
              {lang === 'en' ? 'Live Alert' : 'Siaran Langsung'}
            </span>
          </div>
          <div style={{ fontSize: '0.813rem', color: '#B45309', marginTop: '2px' }}>
            {lang === 'en' 
              ? 'Maintenance for digital epub and pdf reader pipeline scheduled for this weekend. All services remain online.'
              : 'Pemeliharaan server pembaca format digital dijadwalkan akhir pekan ini. Seluruh katalog tetap dapat diakses normal.'
            }
          </div>
        </div>
      </div>

      <div style={{
        fontSize: '0.75rem',
        fontWeight: 700,
        color: '#92400E',
        background: '#FFFFFF',
        padding: '6px 12px',
        borderRadius: '8px',
        border: '1px solid #FDE68A',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <Info size={14} color="#D97706" />
        <span>{lang === 'en' ? 'Controlled via Notification Settings' : 'Dikelola via Pengaturan Notifikasi'}</span>
      </div>
    </div>
  );
}
