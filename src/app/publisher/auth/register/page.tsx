'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PublisherRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Password tidak cocok');
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
        setStep(2); // Move to avatar upload step
      } else {
        setError(json.error || 'Pendaftaran gagal');
      }
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
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
    const doRedirect = () => {
      if (window.parent !== window) {
        window.parent.postMessage('AUTH_SUCCESS', '*');
      } else {
        router.push('/publisher/dashboard');
      }
    };

    if (!avatarFile) {
      doRedirect();
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('publisher_token');
    
    try {
      const formData = new FormData();
      formData.append('name', form.name); // keep the name
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
      doRedirect();
    } catch (e) {
      // Proceed to dashboard even if avatar upload fails
      doRedirect();
    } finally {
      setLoading(false);
    }
  };

  const skipAvatar = () => {
    if (window.parent !== window) {
      window.parent.postMessage('AUTH_SUCCESS', '*');
    } else {
      router.push('/publisher/dashboard');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">📚</div>
          <h1 className="auth-title">{step === 1 ? 'Daftar Publisher' : 'Foto Profil'}</h1>
          <p className="auth-subtitle">
            {step === 1 ? 'Bergabung dan mulai terbitkan ebook kamu' : 'Tambahkan foto profil agar lebih terpercaya'}
          </p>
        </div>

        {step === 1 && (
          <>
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">Nama Publisher / Penerbit</label>
                <input
                  id="name"
                  type="text"
                  className="form-input"
                  placeholder="Nama penerbit atau nama kamu"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="email@publisher.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">Nomor HP (opsional)</label>
                <input
                  id="phone"
                  type="tel"
                  className="form-input"
                  placeholder="+62 812 xxxx xxxx"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="Minimal 8 karakter"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Konfirmasi Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-input"
                  placeholder="Ulangi password"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                />
              </div>

              {error && (
                <div style={{
                  background: 'rgba(255, 59, 48, 0.08)',
                  border: '1px solid rgba(255, 59, 48, 0.2)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: '0.813rem',
                  color: '#FF3B30',
                  marginBottom: 16,
                }}>
                  ⚠️ {error}
                </div>
              )}

              <button
                id="register-btn"
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: 4 }}
                disabled={loading}
              >
                {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
              </button>
            </form>

            <div className="auth-divider">
              Sudah punya akun?{' '}
              <Link href="/publisher/auth/login?embedded=true" className="auth-link">Masuk</Link>
            </div>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Link href="/" style={{ fontSize: '0.75rem', color: '#9B9B9B' }}>
                ← Kembali ke perpustakaan
              </Link>
            </div>
          </>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div 
              style={{ 
                width: 140, height: 140, borderRadius: '50%', background: '#F5F5F3', 
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px dashed #C9A96E', cursor: 'pointer', marginBottom: 24, position: 'relative'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', color: '#C9A96E' }}>
                  <span style={{ fontSize: 32, display: 'block' }}>📸</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Klik Upload</span>
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

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button 
                className="btn btn-primary btn-lg" 
                onClick={handleAvatarSubmit} 
                disabled={loading || !avatarFile}
              >
                {loading ? 'Menyimpan...' : 'Simpan & Lanjut'}
              </button>
              <button 
                className="btn btn-ghost btn-lg" 
                onClick={skipAvatar} 
                disabled={loading}
              >
                Lewati untuk sekarang
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
