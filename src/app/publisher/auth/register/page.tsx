'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Upload, CheckCircle2 } from 'lucide-react';

export default function PublisherRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('step') === '2') {
        setStep(2);
      }
    }
  }, []);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      setLoading(false);
      return;
    }

    if (!agreed) {
      setError('Anda harus menyetujui Kebijakan Privasi dan Ketentuan Layanan');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/publisher/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });
      const json = await res.json();

      if (json.success) {
        localStorage.setItem('publisher_token', json.data.token);
        localStorage.setItem('publisher_user', JSON.stringify(json.data.user));
        setStep(2);
      } else {
        setError(json.error || 'Pendaftaran gagal');
      }
    } catch {
      setError('Terjadi kesalahan koneksi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarSubmit = async () => {
    if (!avatarFile) {
      router.push('/publisher/dashboard');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('publisher_token');
    
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('avatar', avatarFile);

      const res = await fetch('/api/publisher/profile', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        localStorage.setItem('publisher_user', JSON.stringify(json.data));
      }
      router.push('/publisher/dashboard');
    } catch (e) {
      router.push('/publisher/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const skipAvatar = () => {
    router.push('/publisher/dashboard');
  };

  return (
    // 1. GLOBAL LAYOUT (FULLSCREEN SPLIT)
    <div className="w-full min-h-screen flex bg-white" style={{ minHeight: '100vh', display: 'flex', width: '100%', background: '#FFFFFF' }}>
      
      {/* 2. SISI KIRI (BRANDING & IMAGE - 50% LAYAR) */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12"
        style={{
          width: '50%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px',
          overflow: 'hidden'
        }}
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
          <img src="/logo.svg" alt="Digital Library" style={{ width: '36px', height: '36px' }} />
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
            KEMITRAAN PENERBIT DIGITAL
          </div>
          <h2 className="text-4xl font-extrabold text-white leading-tight" style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Daftarkan Karya Anda ke <br />
            <span style={{ color: '#60A5FA' }}>Panggung Dunia</span>
          </h2>
          <p style={{ fontSize: '1rem', color: '#94A3B8', marginTop: '16px', lineHeight: 1.6 }}>
            Dapatkan hak akses penuh untuk mendistribusikan karya ilmiah, buku referensi, dan edukasi Anda secara aman.
          </p>
        </div>

        {/* Footer Kiri Bawah */}
        <div className="text-sm text-gray-400" style={{ position: 'relative', zIndex: 10, fontSize: '0.813rem', color: '#94A3B8' }}>
          © Perpustakaan Digital. All rights reserved.
        </div>
      </div>

      {/* 3. SISI KANAN (AREA FORM AUTENTIKASI - 50% LAYAR) */}
      <div 
        className="w-full lg:w-1/2 flex items-center justify-center bg-white relative"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFFFFF',
          position: 'relative',
          padding: '48px 24px'
        }}
      >
        {/* Tombol Kembali ke Beranda */}
        <Link 
          href="/publisher"
          className="absolute top-8 right-8 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          style={{
            position: 'absolute',
            top: '32px',
            right: '32px',
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

        {/* 4. DESAIN FORMULIR (CLEAN & TERPUSAT - NO CARD) */}
        <div className="w-full max-w-md px-8" style={{ width: '100%', maxWidth: '440px', padding: '0 16px' }}>
          
          <div style={{ marginBottom: '28px' }}>
            <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
              {step === 1 ? 'Daftar Publisher' : 'Lengkapi Profil Anda'}
            </h1>
            <p className="text-gray-500 mb-8" style={{ fontSize: '0.938rem', color: '#64748B', margin: 0 }}>
              {step === 1 ? 'Mulai terbitkan dan distribusikan karya terbaik Anda' : 'Tambahkan foto profil penerbit untuk verifikasi'}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Input Nama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Nama Publisher / Penerbit
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama instansi atau nama penulis"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  style={{
                    width: '100%',
                    padding: '11px 16px',
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

              {/* Input Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Alamat Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  style={{
                    width: '100%',
                    padding: '11px 16px',
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

              {/* Input Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Nomor HP (WhatsApp)
                </label>
                <input
                  type="tel"
                  placeholder="+62 812 xxxx xxxx"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  style={{
                    width: '100%',
                    padding: '11px 16px',
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Minimal 8 karakter"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    style={{
                      width: '100%',
                      padding: '11px 16px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      fontSize: '0.938rem',
                      color: '#0F172A',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Konfirmasi
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Ulangi password"
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    style={{
                      width: '100%',
                      padding: '11px 16px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      fontSize: '0.938rem',
                      color: '#0F172A',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Checkbox Agreement */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '4px' }}>
                <input 
                  type="checkbox" 
                  id="agree" 
                  checked={agreed} 
                  onChange={(e) => setAgreed(e.target.checked)} 
                  style={{ width: '18px', height: '18px', cursor: 'pointer', marginTop: '2px' }} 
                />
                <label htmlFor="agree" style={{ fontSize: '0.813rem', color: '#64748B', cursor: 'pointer', lineHeight: 1.5 }}>
                  Saya menyetujui <span style={{ color: '#2563EB', fontWeight: 600 }}>Kebijakan Privasi</span> dan <span style={{ color: '#2563EB', fontWeight: 600 }}>Syarat Layanan</span> Perpustakaan Digital.
                </label>
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

              {/* Tombol Register */}
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
                {loading ? 'Mendaftarkan...' : 'Daftar Akun Publisher'}
              </button>

              {/* Link Login */}
              <div className="text-sm text-center mt-6 text-gray-600" style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem', color: '#64748B' }}>
                Sudah punya akun?{' '}
                <Link href="/publisher/auth/login" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>
                  Masuk di sini
                </Link>
              </div>
            </form>
          ) : (
            // STEP 2: AVATAR UPLOAD
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
              <div 
                style={{ 
                  width: 140, height: 140, borderRadius: '50%', background: '#F8FAFC', 
                  overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px dashed #CBD5E1', cursor: 'pointer', position: 'relative'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center', color: '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <Upload size={28} color="#2563EB" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A' }}>Pilih Foto</span>
                  </div>
                )}
              </div>
              
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }} 
              />

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                  onClick={handleAvatarSubmit} 
                  disabled={loading || !avatarFile}
                  style={{
                    width: '100%',
                    background: '#2563EB',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.938rem',
                    padding: '13px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: (!avatarFile || loading) ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  {loading ? 'Menyimpan...' : 'Simpan & Masuk ke Dashboard'}
                </button>

                <button 
                  onClick={skipAvatar} 
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: '#F1F5F9',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    padding: '11px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Lewati untuk Sekarang
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
