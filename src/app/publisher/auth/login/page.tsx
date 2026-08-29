'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PublisherLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Auto-redirect if already logged in
    const token = typeof window !== 'undefined' ? localStorage.getItem('publisher_token') : null;
    if (!token) return; // No token, nothing to do

    fetch('/api/publisher/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(j => {
        if (j.success) {
          // If embedded in iframe, tell parent to do the full redirect
          // (avoids split-screen caused by navigating inside the iframe)
          if (window.parent !== window) {
            window.parent.postMessage('AUTH_SUCCESS', '*');
          } else {
            router.push('/publisher/dashboard');
          }
        } else {
          // Token invalid — clear it
          localStorage.removeItem('publisher_token');
          localStorage.removeItem('publisher_user');
        }
      })
      .catch(() => {});
  }, []);

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
        // Store token in localStorage for client-side access
        localStorage.setItem('publisher_token', json.data.token);
        localStorage.setItem('publisher_user', JSON.stringify(json.data.user));
        // If embedded in iframe, notify parent to do full-page redirect
        if (window.parent !== window) {
          window.parent.postMessage('AUTH_SUCCESS', '*');
        } else {
          router.push('/publisher/dashboard');
        }
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
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">📚</div>
          <h1 className="auth-title">Publisher Portal</h1>
          <p className="auth-subtitle">Masuk ke dashboard publisher kamu</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="publisher@email.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
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
            id="login-btn"
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 4 }}
            disabled={loading}
          >
            {loading ? 'Masuk...' : 'Masuk ke Dashboard'}
          </button>
        </form>

        <div className="auth-divider">
          Belum punya akun?{' '}
          <Link href="/publisher/auth/register?embedded=true" className="auth-link">Daftar sekarang</Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link href="/" style={{ fontSize: '0.75rem', color: '#9B9B9B', transition: '0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#C9A96E')}
            onMouseLeave={e => (e.currentTarget.style.color = '#9B9B9B')}>
            ← Kembali ke perpustakaan
          </Link>
        </div>
      </div>
    </div>
  );
}
