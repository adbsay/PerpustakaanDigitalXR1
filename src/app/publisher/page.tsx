'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import PublisherPublicLayout from '@/components/PublisherPublicLayout';
import { 
  ArrowRight, ArrowLeft, Sparkles, Globe2, Rocket, ShieldCheck, Users, 
  Search, UploadCloud, FileText, UserCog, MessageCircle, ChevronDown, ChevronUp,
  Mail, Phone, MapPin, Send, CheckCircle2, Upload
} from 'lucide-react';

type PageType = 'beranda' | 'tentang' | 'faq' | 'kontak';

interface FAQ {
  question: string;
  answer: string;
  category?: string;
}

const faqs: FAQ[] = [
  {
    question: "Mengapa buku saya ditolak oleh admin?",
    answer: "Buku dapat ditolak karena beberapa alasan: resolusi cover terlalu rendah, format PDF rusak atau tidak dapat terbaca, konten melanggar panduan komunitas kami, atau metadata (judul/penulis) tidak sesuai dengan isi buku. Silakan periksa notifikasi pada dashboard Anda untuk rincian alasan penolakan yang spesifik.",
    category: "Kebijakan Konten"
  },
  {
    question: "Format file apa saja yang didukung?",
    answer: "Saat ini kami hanya mendukung file berformat PDF untuk isi buku dengan ukuran maksimal 50MB. Untuk cover buku, kami mendukung format JPG dan PNG dengan ukuran maksimal 2MB dan rasio aspek yang disarankan adalah 3:4.",
    category: "Panduan Unggah"
  },
  {
    question: "Berapa lama proses moderasi buku?",
    answer: "Proses moderasi biasanya memakan waktu 1-2 hari kerja. Tim kurator kami melakukan pengecekan kualitas konten, format, dan kepatuhan terhadap kebijakan hak cipta. Anda akan menerima notifikasi segera setelah status buku disetujui atau ditolak.",
    category: "Kebijakan Konten"
  },
  {
    question: "Bagaimana cara mengubah harga atau status buku?",
    answer: "Anda dapat memperbarui informasi buku kapan saja melalui menu 'My Ebooks' di dashboard Publisher. Klik ikon edit pada buku yang ingin Anda ubah untuk memperbarui metadata atau file.",
    category: "Panduan Unggah"
  },
  {
    question: "Apakah saya mempertahankan hak cipta buku saya?",
    answer: "Ya, 100% hak cipta tetap berada di tangan Anda sebagai penulis atau penerbit. Digital Library hanya bertindak sebagai platform distribusi dan ruang baca digital non-eksklusif.",
    category: "Kebijakan Konten"
  }
];

const faqCategories = [
  { icon: UploadCloud, title: 'Panduan Unggah', desc: 'Cara upload, format file, dan metadata' },
  { icon: FileText, title: 'Kebijakan Konten', desc: 'Hak cipta, konten terlarang, moderasi' },
  { icon: UserCog, title: 'Masalah Akun', desc: 'Login, keamanan, dan pengaturan profil' }
];

export default function PublisherLandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Navigation State
  const viewParam = searchParams.get('view') as PageType | null;
  const initialPage: PageType = (viewParam && ['beranda', 'tentang', 'faq', 'kontak'].includes(viewParam)) ? viewParam : 'beranda';
  const [activePage, setActivePage] = useState<PageType>(initialPage);

  // Auth Sliding Panel State (SPA Transition)
  const authParam = searchParams.get('auth');
  const [isAuthPage, setIsAuthPage] = useState(authParam === 'login' || authParam === 'register');
  const [authMode, setAuthMode] = useState<'login' | 'register'>(authParam === 'register' ? 'register' : 'login');
  
  // Auth Form States
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [agreed, setAgreed] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Register Step 2 (Avatar)
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // FAQ state
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string | null>(null);

  // Contact form state
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactSent, setContactSent] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);

  useEffect(() => {
    const view = searchParams.get('view') as PageType | null;
    if (view && ['beranda', 'tentang', 'faq', 'kontak'].includes(view)) {
      setActivePage(view);
    }
  }, [searchParams]);

  const handlePageChange = (page: PageType) => {
    setIsAuthPage(false);
    setActivePage(page);
    const url = page === 'beranda' ? '/publisher' : `/publisher?view=${page}`;
    window.history.pushState(null, '', url);
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthPage(true);
    setAuthError('');
    window.history.pushState(null, '', `/publisher?auth=${mode}`);
  };

  const handleCloseAuth = () => {
    setIsAuthPage(false);
    setAuthError('');
    const url = activePage === 'beranda' ? '/publisher' : `/publisher?view=${activePage}`;
    window.history.pushState(null, '', url);
  };

  // Auth Submit Handlers
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/publisher/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const json = await res.json();

      if (json.success) {
        localStorage.setItem('publisher_token', json.data.token);
        localStorage.setItem('publisher_user', JSON.stringify(json.data.user));
        router.push('/publisher/dashboard');
      } else {
        setAuthError(json.error || 'Email atau password salah');
      }
    } catch {
      setAuthError('Terjadi kesalahan koneksi. Silakan coba lagi.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setAuthError('Konfirmasi password tidak cocok');
      setAuthLoading(false);
      return;
    }

    if (!agreed) {
      setAuthError('Anda harus menyetujui Kebijakan Privasi dan Ketentuan Layanan');
      setAuthLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/publisher/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          phone: registerForm.phone,
          password: registerForm.password,
        }),
      });
      const json = await res.json();

      if (json.success) {
        localStorage.setItem('publisher_token', json.data.token);
        localStorage.setItem('publisher_user', JSON.stringify(json.data.user));
        setRegisterStep(2);
      } else {
        setAuthError(json.error || 'Pendaftaran gagal');
      }
    } catch {
      setAuthError('Terjadi kesalahan koneksi. Silakan coba lagi.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setAuthLoading(true);
    const token = localStorage.getItem('publisher_token');
    
    try {
      const formData = new FormData();
      formData.append('name', registerForm.name);
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
    } catch {
      router.push('/publisher/dashboard');
    } finally {
      setAuthLoading(false);
    }
  };

  const isBeranda = activePage === 'beranda';

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedFaqCategory ? faq.category === selectedFaqCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    setTimeout(() => {
      setContactSubmitting(false);
      setContactSent(true);
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setContactSent(false), 5000);
    }, 1000);
  };

  return (
    <PublisherPublicLayout 
      activePage={activePage} 
      onNavigate={handlePageChange}
      isAuthPage={isAuthPage}
      onAuthClick={handleOpenAuth}
    >
      
      {/* ======================================================== */}
      {/* 1. BACKGROUND STATIS & OVERLAY                           */}
      {/* ======================================================== */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0
        }}
      />
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(2, 6, 23, 0.85)',
          zIndex: 0
        }}
      />

      {/* ======================================================== */}
      {/* 5. KONTEN TEKS KIRI (MUNCUL SAAT isAuthPage === true)     */}
      {/* ======================================================== */}
      <div 
        style={{
          position: 'fixed',
          top: '50%',
          transform: isAuthPage ? 'translateY(-50%) translateX(0)' : 'translateY(-50%) translateX(-40px)',
          left: '48px',
          width: 'calc(50% - 96px)',
          maxWidth: '480px',
          zIndex: 20,
          opacity: isAuthPage ? 1 : 0,
          pointerEvents: isAuthPage ? 'auto' : 'none',
          transition: 'all 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
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
        <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.2, letterSpacing: '-0.02em', margin: 0 }}>
          Gerbang Menuju <br />
          <span style={{ color: '#60A5FA' }}>Pengetahuan Global</span>
        </h2>
        <p style={{ fontSize: '1rem', color: '#94A3B8', marginTop: '16px', lineHeight: 1.6 }}>
          Publikasikan, kelola katalog, dan jangkau ratusan ribu pembaca akademik di seluruh penjuru dunia.
        </p>

        <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', gap: '16px', color: '#64748B', fontSize: '0.813rem' }}>
          <span>© Perpustakaan Digital</span>
          <span>•</span>
          <span>Sistem Kurasi Mandiri</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. PANEL KANAN PUTIH (SLIDE IN ANIMATION)                */}
      {/* ======================================================== */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '50%',
          minWidth: '380px',
          height: '100vh',
          background: '#FFFFFF',
          zIndex: 60,
          boxShadow: isAuthPage ? '-20px 0 60px rgba(0,0,0,0.3)' : 'none',
          transform: isAuthPage ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 32px',
          overflowY: 'auto'
        }}
      >
        {/* Tombol Kembali ke Beranda (Pojok Kanan Atas) */}
        <button
          onClick={handleCloseAuth}
          style={{
            position: 'absolute',
            top: '32px',
            right: '32px',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#64748B',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'color 0.15s ease'
          }}
        >
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </button>

        {/* Form Container (Clean & Terpusat - No Card) */}
        <div style={{ width: '100%', maxWidth: '420px', padding: '0 8px' }}>
          
          {/* Form Header */}
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
              {authMode === 'login' ? 'Publisher Portal' : (registerStep === 1 ? 'Daftar Publisher' : 'Lengkapi Profil')}
            </h1>
            <p style={{ fontSize: '0.938rem', color: '#64748B', margin: 0 }}>
              {authMode === 'login' 
                ? 'Masuk ke dashboard publisher Anda' 
                : (registerStep === 1 ? 'Mulai terbitkan karya terbaik Anda' : 'Tambahkan foto profil untuk verifikasi')
              }
            </p>
          </div>

          {/* ======================= */}
          {/* LOGIN FORM              */}
          {/* ======================= */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Email Akun
                </label>
                <input
                  type="email"
                  required
                  placeholder="publisher@email.com"
                  value={loginForm.email}
                  onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
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

              {authError && (
                <div style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '0.813rem',
                  fontWeight: 600,
                  color: '#DC2626'
                }}>
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                style={{
                  width: '100%',
                  background: '#2563EB',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '1rem',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: authLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 20px rgba(37,99,235,0.25)',
                  marginTop: '8px',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {authLoading ? 'Masuk...' : 'Masuk Sekarang'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.875rem', color: '#64748B' }}>
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthError(''); setRegisterStep(1); }}
                  style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  Daftar sekarang
                </button>
              </div>
            </form>
          )}

          {/* ======================= */}
          {/* REGISTER FORM           */}
          {/* ======================= */}
          {authMode === 'register' && registerStep === 1 && (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Nama Publisher
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama instansi atau nama penulis"
                  value={registerForm.name}
                  onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    color: '#0F172A',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={registerForm.email}
                  onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    color: '#0F172A',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Nomor HP (WhatsApp)
                </label>
                <input
                  type="tel"
                  placeholder="+62 812 xxxx xxxx"
                  value={registerForm.phone}
                  onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    color: '#0F172A',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Min. 8 char"
                    value={registerForm.password}
                    onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      color: '#0F172A',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Konfirmasi
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Ulangi"
                    value={registerForm.confirmPassword}
                    onChange={e => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      color: '#0F172A',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '2px' }}>
                <input 
                  type="checkbox" 
                  id="agree_spa" 
                  checked={agreed} 
                  onChange={(e) => setAgreed(e.target.checked)} 
                  style={{ width: '16px', height: '16px', cursor: 'pointer', marginTop: '2px' }} 
                />
                <label htmlFor="agree_spa" style={{ fontSize: '0.75rem', color: '#64748B', cursor: 'pointer', lineHeight: 1.4 }}>
                  Saya menyetujui <span style={{ color: '#2563EB', fontWeight: 600 }}>Kebijakan Privasi</span> & <span style={{ color: '#2563EB', fontWeight: 600 }}>Syarat Layanan</span>.
                </label>
              </div>

              {authError && (
                <div style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  fontSize: '0.813rem',
                  fontWeight: 600,
                  color: '#DC2626'
                }}>
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                style={{
                  width: '100%',
                  background: '#2563EB',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.938rem',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: authLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 6px 16px rgba(37,99,235,0.25)',
                  marginTop: '4px',
                  transition: 'all 0.2s ease'
                }}
              >
                {authLoading ? 'Mendaftarkan...' : 'Daftar Akun Publisher'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.813rem', color: '#64748B' }}>
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(''); }}
                  style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  Masuk di sini
                </button>
              </div>
            </form>
          )}

          {/* ======================= */}
          {/* REGISTER STEP 2: AVATAR */}
          {/* ======================= */}
          {authMode === 'register' && registerStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div 
                style={{ 
                  width: 120, height: 120, borderRadius: '50%', background: '#F8FAFC', 
                  overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px dashed #CBD5E1', cursor: 'pointer', position: 'relative'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center', color: '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <Upload size={24} color="#2563EB" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A' }}>Upload Foto</span>
                  </div>
                )}
              </div>
              
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef}
                onChange={handleAvatarFileChange}
                style={{ display: 'none' }} 
              />

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                  onClick={handleAvatarSubmit} 
                  disabled={authLoading || !avatarFile}
                  style={{
                    width: '100%',
                    background: '#2563EB',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.938rem',
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: (!avatarFile || authLoading) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {authLoading ? 'Menyimpan...' : 'Simpan & Lanjut'}
                </button>

                <button 
                  onClick={() => router.push('/publisher/dashboard')} 
                  disabled={authLoading}
                  style={{
                    width: '100%',
                    background: '#F1F5F9',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '0.813rem',
                    padding: '10px',
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

      {/* ======================================================== */}
      {/* 3. HERO & MAIN CONTENT AREA                              */}
      {/* ======================================================== */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* HERO SECTION */}
        <section 
          style={{
            position: 'relative',
            width: '100%',
            height: isBeranda ? '100vh' : '450px',
            minHeight: isBeranda ? '100vh' : '450px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            transition: 'height 0.65s cubic-bezier(0.22, 1, 0.36, 1), min-height 0.65s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {/* --- A. HERO KONTEN: BERANDA (MENGHILANG SAAT isAuthPage === true) --- */}
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '0 24px',
              maxWidth: '960px',
              margin: '0 auto',
              opacity: (isBeranda && !isAuthPage) ? 1 : 0,
              transform: (isBeranda && !isAuthPage) ? 'translateY(0)' : 'translateY(-20px)',
              pointerEvents: (isBeranda && !isAuthPage) ? 'auto' : 'none',
              transition: 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 20px',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#93C5FD',
              marginBottom: '28px',
              letterSpacing: '0.04em'
            }}>
              <Sparkles size={16} />
              PUBLISHER PORTAL PERPUSTAKAAN DIGITAL
            </div>

            <h1 
              style={{
                fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)',
                fontWeight: 900,
                color: '#FFFFFF',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                marginBottom: '24px',
                textShadow: '0 4px 24px rgba(0, 0, 0, 0.6)'
              }}
            >
              Gerbang Menuju <br />
              <span style={{ 
                background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Pengetahuan Global
              </span>
            </h1>

            <p 
              style={{
                fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
                color: '#E2E8F0',
                maxWidth: '780px',
                margin: '0 auto 40px',
                lineHeight: 1.65,
                fontWeight: 300
              }}
            >
              Satu platform komprehensif untuk menerbitkan, mengkurasi, dan menyebarkan literatur ilmiah serta edukatif Anda ke panggung dunia tanpa batasan fisik.
            </p>

            <button 
              onClick={() => handleOpenAuth('login')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                background: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1.125rem',
                padding: '18px 44px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 0 35px rgba(37, 99, 235, 0.45)',
                transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
            >
              MULAI MENULIS
              <ArrowRight size={20} />
            </button>
          </div>

          {/* --- B. HERO KONTEN: TENTANG KAMI --- */}
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '0 24px',
              maxWidth: '960px',
              margin: '0 auto',
              opacity: (activePage === 'tentang' && !isAuthPage) ? 1 : 0,
              transform: (activePage === 'tentang' && !isAuthPage) ? 'translateY(0)' : 'translateY(24px)',
              pointerEvents: (activePage === 'tentang' && !isAuthPage) ? 'auto' : 'none',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}
          >
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#93C5FD',
              marginBottom: '16px',
              letterSpacing: '0.05em'
            }}>
              TENTANG KAMI
            </div>

            <h1 style={{
              fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
              fontWeight: 900,
              color: '#FFFFFF',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '16px',
            }}>
              Membangun Ekosistem <br />
              <span style={{ 
                background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Literasi Digital Nusantara
              </span>
            </h1>

            <p style={{
              fontSize: '1.063rem',
              color: '#CBD5E1',
              maxWidth: '680px',
              margin: '0 auto',
              lineHeight: 1.6,
              fontWeight: 300
            }}>
              Menghubungkan jutaan pembaca cerdas dengan karya tulis ilmiah, buku ajar, dan literatur bermutu dari penerbit terpercaya.
            </p>
          </div>

          {/* --- C. HERO KONTEN: FAQ --- */}
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '0 24px',
              maxWidth: '960px',
              margin: '0 auto',
              opacity: (activePage === 'faq' && !isAuthPage) ? 1 : 0,
              transform: (activePage === 'faq' && !isAuthPage) ? 'translateY(0)' : 'translateY(24px)',
              pointerEvents: (activePage === 'faq' && !isAuthPage) ? 'auto' : 'none',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}
          >
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#93C5FD',
              marginBottom: '16px',
              letterSpacing: '0.05em'
            }}>
              PUSAT BANTUAN & FAQ
            </div>

            <h1 style={{
              fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
              fontWeight: 900,
              color: '#FFFFFF',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '16px',
            }}>
              Pertanyaan yang Sering Diajukan
            </h1>

            <p style={{
              fontSize: '1.063rem',
              color: '#CBD5E1',
              maxWidth: '640px',
              margin: '0 auto',
              lineHeight: 1.6,
              fontWeight: 300
            }}>
              Temukan jawaban komprehensif seputar proses penerbitan, panduan berkas, hak cipta, dan pengelolaan akun.
            </p>
          </div>

          {/* --- D. HERO KONTEN: KONTAK --- */}
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '0 24px',
              maxWidth: '960px',
              margin: '0 auto',
              opacity: (activePage === 'kontak' && !isAuthPage) ? 1 : 0,
              transform: (activePage === 'kontak' && !isAuthPage) ? 'translateY(0)' : 'translateY(24px)',
              pointerEvents: (activePage === 'kontak' && !isAuthPage) ? 'auto' : 'none',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}
          >
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#93C5FD',
              marginBottom: '16px',
              letterSpacing: '0.05em'
            }}>
              HUBUNGI KAMI
            </div>

            <h1 style={{
              fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
              fontWeight: 900,
              color: '#FFFFFF',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '16px',
            }}>
              Mari Berkolaborasi Bersama
            </h1>

            <p style={{
              fontSize: '1.063rem',
              color: '#CBD5E1',
              maxWidth: '640px',
              margin: '0 auto',
              lineHeight: 1.6,
              fontWeight: 300
            }}>
              Tim kurator dan kemitraan kami siap membantu Anda mendistribusikan karya secara maksimal.
            </p>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SLIDE-UP CONTENT SHEET CONTAINER                         */}
        {/* ======================================================== */}
        <div
          style={{
            width: '100%',
            background: '#FFFFFF',
            borderRadius: '32px 32px 0 0',
            boxShadow: '0 -15px 40px rgba(0, 0, 0, 0.15)',
            minHeight: isBeranda ? '0px' : '100vh',
            maxHeight: isBeranda ? '0px' : '9000px',
            opacity: (isBeranda || isAuthPage) ? 0 : 1,
            transform: (isBeranda || isAuthPage) ? 'translateY(100%)' : 'translateY(0)',
            overflow: 'hidden',
            pointerEvents: (isBeranda || isAuthPage) ? 'none' : 'auto',
            transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), max-height 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {/* TENTANG KAMI CONTENT */}
          {activePage === 'tentang' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
              <section style={{ width: '100%', background: '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '56px 24px', width: '100%' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', textAlign: 'center', rowGap: '32px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #F1F5F9' }}>
                      <div style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 900, color: '#0F172A', lineHeight: 1, marginBottom: '8px' }}>50+</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>MITRA INSTITUSI</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #F1F5F9' }}>
                      <div style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 900, color: '#0F172A', lineHeight: 1, marginBottom: '8px' }}>100K+</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>PEMBACA AKTIF</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #F1F5F9' }}>
                      <div style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 900, color: '#0F172A', lineHeight: 1, marginBottom: '8px' }}>15K+</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>KOLEKSI EBOOK</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 900, color: '#0F172A', lineHeight: 1, marginBottom: '8px' }}>24/7</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AKSES GLOBAL</div>
                    </div>
                  </div>
                </div>
              </section>

              <section style={{ width: '100%', background: '#F8FAFC', padding: '64px 24px 80px', textAlign: 'center' }}>
                <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                  <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>
                    Siap Memulai Langkah Anda?
                  </h2>
                  <p style={{ color: '#64748B', fontSize: '1rem', lineHeight: 1.6, marginBottom: '24px' }}>
                    Bergabunglah dengan ribuan penerbit lainnya untuk mendistribusikan karya terbaik Anda secara global.
                  </p>
                  <button 
                    onClick={() => handleOpenAuth('register')}
                    style={{
                      marginTop: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      justifyContent: 'center',
                      background: '#2563EB',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '1rem',
                      padding: '14px 40px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(37, 99, 235, 0.4)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Daftar Sekarang <Users size={18} />
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* FAQ CONTENT */}
          {activePage === 'faq' && (
            <div style={{ width: '100%', background: '#F8FAFC', padding: '64px 24px 100px' }}>
              <div style={{ maxWidth: '920px', margin: '0 auto', width: '100%' }}>
                
                {/* 3 Topik Card */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '64px' }}>
                  {faqCategories.map((cat, idx) => {
                    const Icon = cat.icon;
                    return (
                      <div 
                        key={idx}
                        onClick={() => setSelectedFaqCategory(selectedFaqCategory === cat.title ? null : cat.title)}
                        style={{
                          background: selectedFaqCategory === cat.title ? '#EFF6FF' : '#FFFFFF',
                          border: selectedFaqCategory === cat.title ? '2px solid #3B82F6' : '1px solid #E2E8F0',
                          borderRadius: '20px',
                          padding: '32px 24px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          background: selectedFaqCategory === cat.title ? '#2563EB' : '#F1F5F9',
                          color: selectedFaqCategory === cat.title ? '#FFFFFF' : '#2563EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '20px'
                        }}>
                          <Icon size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                          {cat.title}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                          {cat.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* FAQ Accordion */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {filteredFaqs.map((faq, index) => {
                    const isOpen = openFaqIndex === index;
                    return (
                      <div
                        key={index}
                        style={{
                          background: '#FFFFFF',
                          border: isOpen ? '1px solid #3B82F6' : '1px solid #E2E8F0',
                          borderRadius: '16px',
                          overflow: 'hidden',
                          boxShadow: isOpen ? '0 8px 24px rgba(59, 130, 246, 0.08)' : '0 2px 6px rgba(0, 0, 0, 0.02)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '24px 28px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <span style={{ fontSize: '1.063rem', fontWeight: 700, color: isOpen ? '#1D4ED8' : '#0F172A' }}>
                            {faq.question}
                          </span>
                          <span style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: isOpen ? '#EFF6FF' : '#F8FAFC',
                            color: isOpen ? '#2563EB' : '#64748B',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </span>
                        </button>
                        
                        {isOpen && (
                          <div style={{ padding: '0 28px 24px', color: '#475569', fontSize: '0.938rem', lineHeight: 1.7 }}>
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          )}

          {/* KONTAK CONTENT */}
          {activePage === 'kontak' && (
            <div style={{ width: '100%', background: '#F8FAFC', padding: '64px 24px 100px' }}>
              <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'start' }}>
                  
                  {/* Info Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div>
                      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: '0 0 12px' }}>
                        Pusat Dukungan Mitra
                      </h2>
                      <p style={{ fontSize: '0.938rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                        Ada pertanyaan mengenai kemitraan atau kendala sistem? Silakan hubungi kami melalui saluran berikut.
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#FFFFFF', padding: '16px 20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Mail size={22} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Email Resmi</div>
                          <div style={{ fontSize: '0.938rem', fontWeight: 700, color: '#0F172A' }}>support@perpustakaandigital.id</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#FFFFFF', padding: '16px 20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Phone size={22} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Layanan Cepat</div>
                          <div style={{ fontSize: '0.938rem', fontWeight: 700, color: '#0F172A' }}>+62 812-3456-7890</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#FFFFFF', padding: '16px 20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#F8FAFC', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <MapPin size={22} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Lokasi Kantor</div>
                          <div style={{ fontSize: '0.938rem', fontWeight: 700, color: '#0F172A' }}>Gedung Literasi Indonesia Lt. 5, Jakarta</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Column */}
                  <div style={{ background: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '36px', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '20px' }}>
                      Kirim Pesan Langsung
                    </h3>

                    {contactSent ? (
                      <div style={{ padding: '24px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '16px', textAlign: 'center', color: '#065F46' }}>
                        <CheckCircle2 size={36} style={{ margin: '0 auto 12px', color: '#10B981' }} />
                        <h4 style={{ fontSize: '1.063rem', fontWeight: 800, margin: '0 0 6px' }}>Pesan Berhasil Terkirim!</h4>
                        <p style={{ fontSize: '0.875rem', margin: 0 }}>Tim kami akan segera menghubungi Anda kembali.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Nama Lengkap</label>
                          <input 
                            type="text" 
                            required 
                            value={contactForm.name}
                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                            placeholder="Nama Anda"
                            style={{ width: '100%', padding: '12px 16px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', fontSize: '0.875rem', outline: 'none' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Alamat Email</label>
                          <input 
                            type="email" 
                            required 
                            value={contactForm.email}
                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                            placeholder="email@domain.com"
                            style={{ width: '100%', padding: '12px 16px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', fontSize: '0.875rem', outline: 'none' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Subjek</label>
                          <input 
                            type="text" 
                            required 
                            value={contactForm.subject}
                            onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                            placeholder="Subjek pertanyaan"
                            style={{ width: '100%', padding: '12px 16px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', fontSize: '0.875rem', outline: 'none' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Pesan</label>
                          <textarea 
                            rows={4}
                            required 
                            value={contactForm.message}
                            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                            placeholder="Tuliskan pesan Anda..."
                            style={{ width: '100%', padding: '12px 16px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', fontSize: '0.875rem', outline: 'none', resize: 'none' }}
                          />
                        </div>

                        <button 
                          type="submit"
                          disabled={contactSubmitting}
                          style={{
                            width: '100%',
                            padding: '14px',
                            background: '#0F172A',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '0.938rem',
                            fontWeight: 700,
                            cursor: contactSubmitting ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            marginTop: '8px'
                          }}
                        >
                          {contactSubmitting ? 'Mengirim...' : <><Send size={16} /> Kirim Pesan</>}
                        </button>
                      </form>
                    )}
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </PublisherPublicLayout>
  );
}
