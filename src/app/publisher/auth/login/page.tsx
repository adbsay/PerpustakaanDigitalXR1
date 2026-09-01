'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function PublisherLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Auto-redirect if already logged in
    const token = typeof window !== 'undefined' ? localStorage.getItem('publisher_token') : null;
    if (!token) return;

    fetch('/api/publisher/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(j => {
        if (j.success) {
          router.push('/publisher/dashboard');
        } else {
          localStorage.removeItem('publisher_token');
          localStorage.removeItem('publisher_user');
        }
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/publisher/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (json.success) {
        localStorage.setItem('publisher_token', json.data.token);
        localStorage.setItem('publisher_user', JSON.stringify(json.data.user));
        router.push('/publisher/dashboard');
      } else {
        setError(json.error || 'Email atau password salah');
      }
    } catch {
      setError('Terjadi kesalahan koneksi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // 1. GLOBAL LAYOUT (FULLSCREEN SPLIT ON DESKTOP, CLEAN FULL-WIDTH ON MOBILE)
    <div className="w-full min-h-screen flex flex-col lg:flex-row bg-white">
      
      {/* 2. SISI KIRI (BRANDING & IMAGE - HANYA DI DESKTOP 50%) */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
      >
        {/* Background Image Perpustakaan */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Overlay Gelap */}
        <div 
          className="absolute inset-0 bg-slate-950/85"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.85)',
            zIndex: 1
          }}
        />

        {/* Header Kiri Atas */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src="/publisher-icon.svg" 
            alt="Digital Library" 
            style={{ 
              width: '36px', 
              height: '36px',
              objectFit: 'contain',
              filter: 'brightness(0) saturate(100%) invert(67%) sepia(81%) saturate(2256%) hue-rotate(180deg) brightness(102%) contrast(98%) drop-shadow(0 0 10px rgba(56, 189, 248, 0.6))'
            }} 
          />
          <span className="text-white font-bold text-xl tracking-wider" style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '0.05em' }}>
            PERPUSTAKAAN DIGITAL
          </span>
        </div>

        {/* Teks Tengah Kiri */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '480px' }}>
          <div style={{
            color: '#60A5FA',
            fontWeight: 800,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            marginBottom: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Sparkles size={14} />
            RUANG PENERBIT DIGITAL
          </div>
          <h2 className="text-4xl font-extrabold text-white leading-tight" style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Gerbang Menuju <br />
            <span style={{ color: '#60A5FA' }}>Pengetahuan Global</span>
          </h2>
          <p style={{ fontSize: '1rem', color: '#94A3B8', marginTop: '16px', lineHeight: 1.6 }}>
            Publikasikan, kelola katalog, dan jangkau ratusan ribu pembaca akademik di seluruh penjuru dunia.
          </p>
        </div>

        {/* Footer Kiri Bawah */}
        <div className="text-sm text-gray-400" style={{ position: 'relative', zIndex: 10, fontSize: '0.813rem', color: '#94A3B8' }}>
          © Perpustakaan Digital. All rights reserved.
        </div>
      </div>

      {/* 3. SISI KANAN (AREA FORM AUTENTIKASI - FULL WIDTH DI MOBILE, 50% DI DESKTOP) */}
      <div 
        className="w-full lg:w-1/2 min-h-screen flex flex-col justify-center items-center bg-white relative px-6 py-12 sm:px-12"
      >
        {/* Tombol Kembali ke Beranda */}
        <Link 
          href="/publisher"
          className="absolute top-6 right-6 sm:top-8 sm:right-8 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#64748B',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'color 0.15s ease'
          }}
        >
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>

        {/* 4. DESAIN FORMULIR (CLEAN & TERPUSAT) */}
        <div className="w-full max-w-md">
          
          <div style={{ marginBottom: '32px' }}>
            <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
              Publisher Portal
            </h1>
            <p className="text-gray-500 mb-8" style={{ fontSize: '0.938rem', color: '#64748B', margin: 0 }}>
              Masuk ke dashboard publisher Anda
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Input Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Email Akun
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="publisher@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  fontSize: '0.938rem',
                  color: '#0F172A',
                  outline: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}
              />
            </div>

            {/* Input Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', margin: 0 }}>
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  fontSize: '0.938rem',
                  color: '#0F172A',
                  outline: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '0.813rem',
                fontWeight: 600,
                color: '#DC2626'
              }}>
                {error}
              </div>
            )}

            {/* Tombol Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-[0_8px_20px_rgba(37,99,235,0.2)] transition-all mt-6"
              style={{
                width: '100%',
                background: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '1rem',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 20px rgba(37,99,235,0.25)',
                marginTop: '8px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {loading ? 'Masuk...' : 'Masuk Sekarang'}
            </button>
          </form>

          {/* Link Register */}
          <div className="text-sm text-center mt-6 text-gray-600" style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: '#64748B' }}>
            Belum punya akun?{' '}
            <Link href="/publisher/auth/register" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>
              Daftar sekarang
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
