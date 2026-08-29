'use client';

import PublisherPublicLayout from '@/components/PublisherPublicLayout';
import { useSearchParams } from 'next/navigation';

export default function KontakPage() {
  const searchParams = useSearchParams();
  const isEmbedded = searchParams.get('embedded') === 'true';

  const content = (
    <section style={{ 
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: '#FFFFFF', padding: '80px 24px', textAlign: 'center', height: isEmbedded ? '100%' : 'auto'
    }}>
      <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '24px', textTransform: 'uppercase' }}>
          Hubungi Kami
        </h2>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '40px' }}>
          Apakah Anda memiliki pertanyaan atau butuh bantuan? Tim dukungan kami siap membantu Anda.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
          <div style={{ background: '#F8F9FA', padding: '24px', borderRadius: '12px', border: '1px solid #EAEAEA' }}>
            <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>📧 Email Dukungan</div>
            <div style={{ color: '#444' }}>support@perpustakaandigital.com</div>
          </div>
          
          <div style={{ background: '#F8F9FA', padding: '24px', borderRadius: '12px', border: '1px solid #EAEAEA' }}>
            <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>📞 Nomor Telepon</div>
            <div style={{ color: '#444' }}>+62 811-2345-6789</div>
          </div>

          <div style={{ background: '#F8F9FA', padding: '24px', borderRadius: '12px', border: '1px solid #EAEAEA' }}>
            <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>🏢 Alamat Kantor</div>
            <div style={{ color: '#444' }}>Gedung Pengetahuan Nusantara, Lt. 5<br/>Jl. Sudirman No. 123, Jakarta, Indonesia</div>
          </div>
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
