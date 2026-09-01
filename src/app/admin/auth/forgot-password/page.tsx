'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Mail, Lock, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';

function AdminForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [token, setToken] = useState(tokenParam || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'request' | 'reset'>(tokenParam ? 'reset' : 'request');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [directResetUrl, setDirectResetUrl] = useState('');

  useEffect(() => {
    if (tokenParam) {
      setToken(tokenParam);
      setStep('reset');
    }
  }, [tokenParam]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');
    setSuccessMsg('');
    setDirectResetUrl('');

    try {
      const res = await fetch('/api/admin/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(data.data.message || 'Instruksi reset password admin telah disiapkan.');
        if (data.data.token) {
          setToken(data.data.token);
          setDirectResetUrl(data.data.resetUrl || '');
        }
      } else {
        setError(data.error || 'Terjadi kesalahan');
      }
    } catch {
      setError('Gagal menghubungi server. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setError('Password baru admin minimal 8 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg('Password admin berhasil diperbarui! Mengalihkan ke login admin...');
        setTimeout(() => {
          router.push('/admin/auth/login');
        }, 2000);
      } else {
        setError(data.error || 'Gagal mengubah password');
      }
    } catch {
      setError('Gagal menghubungi server. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div 
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#1E293B',
          borderRadius: '24px',
          padding: '40px 36px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid #334155',
        }}
      >
        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
          <div 
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#60A5FA',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              border: '1px solid rgba(96, 165, 250, 0.3)',
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F8FAFC', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            {step === 'request' ? 'Lupa Password Admin' : 'Reset Password Admin'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94A3B8', margin: 0 }}>
            {step === 'request' 
              ? 'Masukkan alamat email administrator Anda untuk memulihkan akses.' 
              : 'Buat password baru yang aman untuk akun Super Admin Anda.'}
          </p>
        </div>

        {error && (
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '20px',
              fontSize: '0.85rem',
              color: '#FCA5A5',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '20px',
              fontSize: '0.85rem',
              color: '#6EE7B7',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: 600 }}>{successMsg}</span>
            </div>
            {directResetUrl && step === 'request' && (
              <button
                type="button"
                onClick={() => setStep('reset')}
                style={{
                  marginTop: '6px',
                  background: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Lanjut Masukkan Password Baru →
              </button>
            )}
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequestReset} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label htmlFor="adminEmail" style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '8px' }}>
                Email Admin
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                <input
                  id="adminEmail"
                  type="email"
                  required
                  placeholder="admin@libra.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '12px',
                    border: '1px solid #475569',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    background: '#0F172A',
                    color: '#F8FAFC',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '12px',
                background: '#2563EB',
                color: '#FFFFFF',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                border: 'none',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              }}
            >
              {loading ? 'Memproses...' : 'Kirim Tautan Reset'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label htmlFor="newAdminPassword" style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '8px' }}>
                Password Baru
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                <input
                  id="newAdminPassword"
                  type="password"
                  required
                  placeholder="Minimal 8 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '12px',
                    border: '1px solid #475569',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    background: '#0F172A',
                    color: '#F8FAFC',
                  }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmAdminPassword" style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '8px' }}>
                Konfirmasi Password Baru
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                <input
                  id="confirmAdminPassword"
                  type="password"
                  required
                  placeholder="Ulangi password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '12px',
                    border: '1px solid #475569',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    background: '#0F172A',
                    color: '#F8FAFC',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '12px',
                background: '#2563EB',
                color: '#FFFFFF',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                border: 'none',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              }}
            >
              {loading ? 'Menyimpan...' : 'Perbarui Password Admin'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '28px', textAlign: 'center' }}>
          <Link
            href="/admin/auth/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#60A5FA',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} /> Kembali ke Login Admin
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F172A' }}>
        <div className="loading-spinner" />
      </div>
    }>
      <AdminForgotPasswordContent />
    </Suspense>
  );
}
