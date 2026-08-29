'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Users, ShieldCheck, Sparkles, Library, Globe2 } from 'lucide-react';

interface StatCounts {
  categories: number;
  publishers: number;
}

export default function TentangKamiPage() {
  const [stats, setStats] = useState<StatCounts>({ categories: 0, publishers: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [catRes, pubRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/publishers'),
        ]);
        const catJson = await catRes.json();
        const pubJson = await pubRes.json();
        setStats({
          categories: catJson.success ? catJson.data.length : 0,
          publishers: pubJson.success ? pubJson.data.length : 0,
        });
      } catch {
        // Silently ignore — stats are a nice-to-have, not critical
      }
    };
    fetchStats();
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: 'Koleksi Beragam',
      text: 'Ribuan ebook dari berbagai kategori — akademik, fiksi, hingga referensi profesional — terus bertambah setiap harinya.',
    },
    {
      icon: Globe2,
      title: 'Akses Tanpa Batas',
      text: 'Baca langsung dari browser kapan saja, di mana saja, tanpa perlu memasang aplikasi tambahan.',
    },
    {
      icon: Users,
      title: 'Gratis Sepenuhnya',
      text: 'Tidak ada biaya berlangganan maupun kewajiban membuat akun untuk menikmati koleksi kami.',
    },
    {
      icon: ShieldCheck,
      title: 'Kurasi Terpercaya',
      text: 'Setiap ebook ditinjau oleh tim kami sebelum tayang, memastikan kualitas dan keaslian konten.',
    },
  ];

  const statItems = [
    { label: 'Kategori Tersedia', value: stats.categories, icon: Library },
    { label: 'Penerbit Mitra', value: stats.publishers, icon: Users },
    { label: 'Akses', value: 'Gratis', icon: Sparkles, isText: true },
  ];

  return (
    <main className="visitor-main">
      {/* ---- HERO ---- */}
      <section style={{ textAlign: 'center', padding: '24px 0 56px', maxWidth: '760px', margin: '0 auto' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--accent-primary-light)',
            color: 'var(--accent-primary)',
            padding: '6px 16px',
            borderRadius: '99px',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '20px',
          }}
        >
          <Sparkles size={14} />
          Perpustakaan Digital
        </div>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '16px' }}>
          Membuka Akses Pengetahuan untuk Semua
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Kami percaya bahwa setiap orang berhak mendapatkan akses ke bacaan berkualitas tanpa
          hambatan biaya maupun birokrasi. Digital Library hadir sebagai ruang baca terbuka yang
          menghubungkan pembaca dengan ribuan ebook pilihan dari berbagai penerbit dan penulis.
        </p>
      </section>

      {/* ---- FEATURE GRID ---- */}
      <section style={{ marginBottom: 56 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
          }}
        >
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '28px 22px',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <Icon size={20} color="var(--accent-primary)" />
                </div>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ fontSize: '0.813rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {f.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---- STATS STRIP ---- */}
      <section
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px 24px',
          marginBottom: 56,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '24px',
          textAlign: 'center',
        }}
      >
        {statItems.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <Icon size={22} color="var(--accent-primary)" />
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {s.isText ? s.value : `${s.value}+`}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {s.label}
              </div>
            </div>
          );
        })}
      </section>

      {/* ---- MISSION / STORY ---- */}
      <section style={{ marginBottom: 56 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '760px', margin: '0 auto' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Visi & Misi Kami</h2>
            <p style={{ fontSize: '0.938rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Kami hadir dengan visi mendemokrasikan akses pengetahuan untuk semua kalangan. Kami
              bermitra dengan berbagai penulis dan penerbit untuk menyediakan literatur berkualitas
              tinggi yang dapat diakses dari mana saja, kapan saja, tanpa biaya.
            </p>
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Apa yang Kami Tawarkan</h2>
            <p style={{ fontSize: '0.938rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Sebagai platform perpustakaan digital, kami dirancang menjadi ruang baca tanpa batas
              fisik. Kami berfokus menyediakan koleksi yang relevan — mulai dari referensi akademik
              hingga bacaan populer — yang disajikan dengan antarmuka bersih dan mudah dinavigasi,
              lengkap dengan fitur pencarian, kategori, dan pembaca PDF langsung di browser.
            </p>
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Komitmen Terhadap Pembaca</h2>
            <p style={{ fontSize: '0.938rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Kami percaya bahwa pencarian literatur tidak boleh rumit. Sistem kami dibangun dengan
              infrastruktur yang memprioritaskan kecepatan pencarian dan kenyamanan membaca di
              berbagai perangkat, memastikan setiap pengunjung dapat menemukan buku yang tepat dalam
              hitungan detik — tanpa perlu mendaftar.
            </p>
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px 24px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Mulai Jelajahi Koleksi Kami</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Temukan bacaan berikutnya dari ribuan ebook yang tersedia, gratis dan tanpa registrasi.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-primary btn-lg">
            Jelajahi Ebook
          </Link>
          <Link href="/kontak" className="btn btn-ghost btn-lg">
            Hubungi Kami
          </Link>
        </div>
      </section>
    </main>
  );
}
