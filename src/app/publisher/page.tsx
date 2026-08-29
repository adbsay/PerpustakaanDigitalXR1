'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PublisherPublicLayout from '@/components/PublisherPublicLayout';

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

export default function PublisherLandingPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(json => {
        if (json.success) setCategories(json.data);
      })
      .catch(() => {});
  }, []);
  return (
    <PublisherPublicLayout>
      {/* Hero Section */}
      <section style={{ 
        position: 'relative', zIndex: 1,
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '80px 24px', background: 'transparent'
      }}>
        <div className="animate-fade-in-up delay-200" style={{
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '80px 60px',
          maxWidth: '850px',
          width: '100%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <h1 style={{ 
            fontFamily: '"Times New Roman", Times, serif',
            fontSize: '56px', 
            fontWeight: 400, 
            marginBottom: '16px', 
            lineHeight: 1.2,
            color: '#FFFFFF',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.6)' 
          }}>
            GERBANG MENUJU<br/>PENGETAHUAN GLOBAL
          </h1>
          <p style={{ 
            fontSize: '24px', 
            color: '#FFFFFF', 
            marginBottom: '40px',
            textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)'
          }}>
            Platform Penerbitan Digital Kelas Dunia
          </p>

          <p style={{
            fontSize: '15px',
            color: '#E0E0E0',
            maxWidth: '600px',
            lineHeight: 1.6,
            marginBottom: '40px',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
          }}>
            Satu platform komprehensif untuk menerbitkan, mengkurasi, dan menyebarkan literatur ilmiah dan edukatif Anda ke panggung dunia.
          </p>

          <Link href="?auth=login" className="ios-btn" style={{
            display: 'inline-block',
            padding: '14px 40px', 
            border: '1px solid rgba(255, 255, 255, 0.6)', 
            borderRadius: '30px', 
            fontSize: '14px', 
            fontWeight: 600, 
            color: '#FFFFFF', 
            textDecoration: 'none',
            textTransform: 'uppercase', 
            letterSpacing: '1px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)'
          }}>
            MULAI MENULIS
          </Link>
        </div>
      </section>

      {/* Categories Section for Publisher */}
      {categories.length > 0 && (
        <section style={{
          position: 'relative', zIndex: 1, padding: '40px 24px 80px',
          display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>
          <h2 style={{
            fontSize: '28px', color: '#FFFFFF', marginBottom: '32px',
            fontFamily: '"Times New Roman", Times, serif', fontWeight: 400,
            textShadow: '1px 1px 4px rgba(0,0,0,0.8)'
          }}>Kategori Pilihan Publisher</h2>
          
          <div style={{
            display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '1000px'
          }}>
            {categories.map(cat => (
              <div key={cat.id} style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                minWidth: '220px',
                transition: 'all 0.3s ease',
                cursor: 'default'
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'rgba(201, 169, 110, 0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {cat.icon ? (
                    <img src={cat.icon} alt={cat.name} style={{ width: '24px', height: '24px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                  ) : (
                    <span style={{ fontSize: '20px' }}>📚</span>
                  )}
                </div>
                <span style={{ fontSize: '1.1rem', fontWeight: 500, color: '#FFFFFF', letterSpacing: '0.5px' }}>
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </PublisherPublicLayout>
  );
}
