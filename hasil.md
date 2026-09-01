Berdasarkan pengecekan yang sudah saya lakukan, ini hasil temuan dari kedua hal yang kamu minta:

1. Setup Prisma Client (src/lib/prisma.ts) File ini sudah menggunakan singleton pattern. Namun, ada kemungkinan implementasi @prisma/adapter-pg yang keliru menjadi penyebab hang. Pada kode di bawah ini, PrismaPg di-instantiate langsung menggunakan connectionString (string), padahal umumnya PrismaPg membutuhkan Pool dari library pg.

Berikut adalah isi dari src/lib/prisma.ts:

typescript
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
// Prisma v7 — adapter-based singleton with hot-reload protection
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg(process.env.DATABASE_URL as string);
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}
export const prisma = globalForPrisma.prisma || createPrismaClient();
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
2. Halaman Login (src/app/admin/auth/login/page.tsx) File ini ternyata adalah Client Component (menggunakan 'use client';) dan TIDAK melakukan query Prisma secara langsung di top-level. Halaman ini memanggil /api/admin/auth/me melalui fetch di dalam useEffect.

Berikut adalah isi dari src/app/admin/auth/login/page.tsx:

tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    fetch('/api/admin/auth/me', { signal: controller.signal })
      .then(r => r.json())
      .then(j => { 
        clearTimeout(timeoutId);
        if (j.success) router.push('/admin/dashboard'); 
      })
      .catch(() => clearTimeout(timeoutId));
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [router]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (json.success) {
        if (json.data?.user) {
          localStorage.setItem('admin_user', JSON.stringify(json.data.user));
        }
        router.push('/admin/dashboard');
      } else {
        setError(json.error || 'Login gagal');
      }
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-page">
      <div className="auth-card" style={{ borderTop: '4px solid #1A1A1A' }}>
        <div className="auth-logo">
          <div className="auth-logo-icon" style={{ background: '#1A1A1A', color: 'white' }}>🛡️</div>
          <h1 className="auth-title">Admin Portal</h1>
          <p className="auth-subtitle">Restricted Access</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <Link 
                href="/admin/auth/forgot-password" 
                style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563EB', textDecoration: 'none' }}
              >
                Lupa Password?
              </Link>
            </div>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div style={{ color: '#FF3B30', fontSize: '0.813rem', marginBottom: 16 }}>⚠️ {error}</div>
          )}
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', background: '#1A1A1A' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Login to Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  );
}
Sebagai informasi tambahan, pengecekan DATABASE_URL di file .env menunjukan bahwa url Postgres sudah benar (postgresql://postgres:bnrgxplwzqp@localhost:5432/libra_db).

Silakan dianalisa, apakah ini masalah karena PrismaPg menerima string di lib/prisma.ts atau ada fix yang lain? Menunggu arahan fix pasti dari kamu!