'use client';

import PublisherPublicLayout from '@/components/PublisherPublicLayout';
import { useSearchParams } from 'next/navigation';

export default function TentangKamiPage() {
  const searchParams = useSearchParams();
  const isEmbedded = searchParams.get('embedded') === 'true';

  const content = (
    <section style={{ 
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: '#FFFFFF', padding: '80px 24px', textAlign: 'center', height: isEmbedded ? '100%' : 'auto'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '32px', textTransform: 'uppercase' }}>
          Tentang Kami
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left', maxWidth: '700px', margin: '0 auto' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#1a1a1a' }}>Visi & Misi Kami</h3>
            <p style={{ fontSize: '16px', color: '#444', lineHeight: 1.6 }}>
              Kami hadir dengan visi mendemokrasikan akses pengetahuan untuk semua kalangan. Kami bermitra dengan berbagai penulis dan institusi pendidikan untuk menyediakan literatur berkualitas tinggi yang dapat diakses dari mana saja.
            </p>
          </div>
          
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#1a1a1a' }}>Apa yang Kami Tawarkan</h3>
            <p style={{ fontSize: '16px', color: '#444', lineHeight: 1.6 }}>
              Sebagai platform perpustakaan digital, Libra dirancang untuk menjadi ruang baca digital tanpa batas fisik. Kami berfokus menyediakan koleksi yang relevan, mulai dari referensi akademik hingga bacaan populer, yang disajikan dengan antarmuka yang bersih dan mudah dinavigasi.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#1a1a1a' }}>Komitmen Terhadap Pembaca</h3>
            <p style={{ fontSize: '16px', color: '#444', lineHeight: 1.6 }}>
              Kami percaya bahwa pencarian literatur tidak boleh rumit. Sistem kami dibangun dengan infrastruktur yang memprioritaskan kecepatan pencarian dan kenyamanan membaca di berbagai layar, memastikan setiap pengunjung dapat menemukan buku yang tepat dalam hitungan detik.
            </p>
          </div>
        </div>

        <div style={{ position: 'absolute', top: '20px', left: '-20px', fontSize: '48px', opacity: 0.8 }}>
          📖
        </div>
        <div style={{ position: 'absolute', top: '20px', right: '-20px', fontSize: '48px', opacity: 0.8 }}>
          🖋️
        </div>
      </div>
    </section>
  );

  if (isEmbedded) return content;
  
  return (
    <PublisherPublicLayout>
      {content}
    </PublisherPublicLayout>
  );
}
