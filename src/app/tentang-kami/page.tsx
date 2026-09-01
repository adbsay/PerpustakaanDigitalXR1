'use client';

import { Globe2, Rocket, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function TentangKamiPage() {
  return (
    <>
      {/* 
        =======================================================
        CSS KHUSUS MOBILE UNTUK LAYOUT VERTIKAL & HEMAT RUANG 
        =======================================================
      */}
      <style>{`
        @media (max-width: 768px) {
          /* Hero Section Compression */
          .tentang-hero-content {
            padding: 80px 16px 40px 16px !important;
          }
          .tentang-hero-badge {
            margin-bottom: 12px !important;
          }
          .tentang-hero-title {
            font-size: 1.75rem !important;
            margin-bottom: 12px !important;
          }
          .tentang-hero-desc {
            font-size: 0.875rem !important;
          }

          /* Stats Bar: Jadi Grid 2x2 yang Rapi */
          .tentang-stats-container {
            padding: 32px 16px !important;
          }
          .tentang-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 24px 16px !important;
          }
          .tentang-stat-item {
            border-right: none !important; /* Hapus border random */
            padding: 0 !important;
          }
          .tentang-stat-number {
            font-size: 2rem !important;
          }

          /* Fitur Cards Compression */
          .tentang-fitur-section {
            padding: 48px 16px !important;
          }
          .tentang-fitur-title {
            font-size: 1.5rem !important;
            margin-bottom: 32px !important;
          }
          .tentang-fitur-card {
            padding: 24px 20px !important;
          }
          .tentang-fitur-icon {
            margin-bottom: 16px !important;
            width: 40px !important;
            height: 40px !important;
          }
          .tentang-fitur-icon svg {
            width: 20px !important;
            height: 20px !important;
          }
          .tentang-card-title {
            font-size: 1.125rem !important;
            margin-bottom: 8px !important;
          }
          .tentang-card-desc {
            font-size: 0.813rem !important;
          }

          /* CTA Section */
          .tentang-cta-section {
            padding: 56px 16px !important;
          }
          .tentang-cta-title {
            font-size: 1.5rem !important;
          }
          .tentang-cta-desc {
            font-size: 0.875rem !important;
          }
          .tentang-cta-btn {
            width: 100% !important;
          }
        }
      `}</style>

      <div style={{ width: '100%', background: '#FFFFFF', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* 1. HERO SECTION */}
        <section style={{
          position: 'relative',
          width: '100%',
          minHeight: '480px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'url("https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
          {/* Dark Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            zIndex: 1
          }}></div>
          
          {/* Centered Hero Content */}
          <div className="tentang-hero-content" style={{
            position: 'relative',
            zIndex: 10,
            textAlign: 'center',
            padding: '110px 24px 60px 24px',
            maxWidth: '1000px',
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <div className="tentang-hero-badge" style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#D1D5DB',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}>
              VISI & MISI KAMI
            </div>
            
            <h1 className="tentang-hero-title" style={{
              fontSize: 'clamp(2rem, 5vw, 3.25rem)',
              fontWeight: 900,
              color: '#FFFFFF',
              lineHeight: 1.2,
              marginBottom: '16px',
              letterSpacing: '-0.02em'
            }}>
              Mendemokrasikan Akses <br />
              <span style={{ color: '#3B82F6' }}>Pengetahuan Global</span>
            </h1>
            
            <p className="tentang-hero-desc" style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.125rem)',
              color: '#E5E7EB',
              maxWidth: '720px',
              margin: '0 auto',
              lineHeight: 1.7,
              fontWeight: 300
            }}>
              Satu platform komprehensif untuk menerbitkan, mengkurasi, dan menyebarkan literatur ilmiah dan edukatif Anda ke panggung dunia tanpa batasan fisik.
            </p>
          </div>
        </section>

        {/* 2. STATS BAR */}
        <section style={{
          width: '100%',
          background: '#FFFFFF',
          borderBottom: '1px solid #F1F5F9',
        }}>
          <div className="tentang-stats-container" style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '56px 24px',
            width: '100%'
          }}>
            <div className="tentang-stats-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              textAlign: 'center',
              rowGap: '32px'
            }}>
              {/* Stat 1 */}
              <div className="tentang-stat-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #F1F5F9' }}>
                <div className="tentang-stat-number" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 900, color: '#0F172A', lineHeight: 1, marginBottom: '8px' }}>
                  50+
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  MITRA INSTITUSI
                </div>
              </div>

              {/* Stat 2 */}
              <div className="tentang-stat-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #F1F5F9' }}>
                <div className="tentang-stat-number" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 900, color: '#0F172A', lineHeight: 1, marginBottom: '8px' }}>
                  100K+
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  PEMBACA AKTIF
                </div>
              </div>

              {/* Stat 3 */}
              <div className="tentang-stat-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #F1F5F9' }}>
                <div className="tentang-stat-number" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 900, color: '#0F172A', lineHeight: 1, marginBottom: '8px' }}>
                  15K+
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  KOLEKSI EBOOK
                </div>
              </div>

              {/* Stat 4 */}
              <div className="tentang-stat-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="tentang-stat-number" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 900, color: '#0F172A', lineHeight: 1, marginBottom: '8px' }}>
                  24/7
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  AKSES DIGITAL
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. FITUR (MENGAPA MEMILIH KAMI) */}
        <section className="tentang-fitur-section" style={{
          width: '100%',
          background: '#F8FAFC',
          padding: '80px 24px',
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%'
          }}>
            <h2 className="tentang-fitur-title" style={{
              textAlign: 'center',
              fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
              fontWeight: 800,
              color: '#0F172A',
              marginBottom: '56px',
              letterSpacing: '-0.02em'
            }}>
              Mengapa Memilih Platform Kami?
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '32px'
            }}>
              {/* Card 1 */}
              <div className="tentang-fitur-card" style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                padding: '40px 32px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
                border: '1px solid #F1F5F9',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}>
                <div className="tentang-fitur-icon" style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '16px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  color: '#2563EB'
                }}>
                  <Globe2 size={24} color="#2563EB" />
                </div>
                
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '4px' }}>
                  Judul
                </span>
                <h3 className="tentang-card-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>
                  Ruang Baca Tanpa Batas
                </h3>
                <p className="tentang-card-desc" style={{ fontSize: '0.938rem', color: '#64748B', lineHeight: 1.65, margin: 0 }}>
                  Dirancang sebagai perpustakaan digital global. Kami menyediakan koleksi referensi akademik dan bacaan populer dengan antarmuka yang sangat bersih dan navigasi super intuitif.
                </p>
              </div>

              {/* Card 2 */}
              <div className="tentang-fitur-card" style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                padding: '40px 32px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
                border: '1px solid #F1F5F9',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}>
                <div className="tentang-fitur-icon" style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '16px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  color: '#2563EB'
                }}>
                  <Rocket size={24} color="#2563EB" />
                </div>
                
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '4px' }}>
                  Judul
                </span>
                <h3 className="tentang-card-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>
                  Infrastruktur Kecepatan Tinggi
                </h3>
                <p className="tentang-card-desc" style={{ fontSize: '0.938rem', color: '#64748B', lineHeight: 1.65, margin: 0 }}>
                  Pencarian literatur tidak boleh rumit. Sistem kami mengutamakan kecepatan query yang didesain untuk memberikan hasil akurat secara instan.
                </p>
              </div>

              {/* Card 3 */}
              <div className="tentang-fitur-card" style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                padding: '40px 32px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
                border: '1px solid #F1F5F9',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}>
                <div className="tentang-fitur-icon" style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '16px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  color: '#2563EB'
                }}>
                  <ShieldCheck size={24} color="#2563EB" />
                </div>
                
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '4px' }}>
                  Judul
                </span>
                <h3 className="tentang-card-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>
                  Keamanan & Privasi Terjamin
                </h3>
                <p className="tentang-card-desc" style={{ fontSize: '0.938rem', color: '#64748B', lineHeight: 1.65, margin: 0 }}>
                  Seluruh karya penulis yang diterbitkan terlindungi dengan enkripsi tingkat lanjut. Kami sangat menghargai hak cipta dan sepenuhnya melindungi karya literatur penerbit.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. CALL TO ACTION */}
        <section className="tentang-cta-section" style={{
          width: '100%',
          background: '#0B132B',
          padding: '80px 24px',
          marginTop: 'auto'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            width: '100%'
          }}>
            <h2 className="tentang-cta-title" style={{
              fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
              fontWeight: 800,
              color: '#FFFFFF',
              margin: 0
            }}>
              Siap Menjadi Bagian dari Kami?
            </h2>
            
            <p className="tentang-cta-desc" style={{
              fontSize: 'clamp(1rem, 2vw, 1.125rem)',
              color: '#94A3B8',
              lineHeight: 1.6,
              maxWidth: '640px',
              margin: 0
            }}>
              Bergabunglah dengan ribuan penerbit lainnya untuk mendistribusikan karya terbaik Anda secara global.
            </p>
            
            <Link 
              href="/publisher" 
              className="tentang-cta-btn"
              style={{
                marginTop: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '1rem',
                padding: '14px 40px',
                borderRadius: '12px',
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(37, 99, 235, 0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              Daftar Sekarang
            </Link>
          </div>
        </section>

      </div>
    </>
  );
}