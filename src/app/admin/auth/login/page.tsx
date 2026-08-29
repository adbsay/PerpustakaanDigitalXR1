'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/auth/me')
      .then(r => r.json())
      .then(j => { if (j.success) router.push('/admin/dashboard'); })
      .catch(() => {});
  }, []);

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
        localStorage.setItem('admin_token', json.data.token);
        localStorage.setItem('admin_user', JSON.stringify(json.data.user));
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
            <label className="form-label">Password</label>
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
