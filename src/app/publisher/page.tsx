'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import PublisherPublicLayout from '@/components/PublisherPublicLayout';
import { 
  ArrowRight, ArrowLeft, Sparkles, Globe2, Rocket, ShieldCheck, Users, 
  Search, UploadCloud, FileText, UserCog, MessageCircle, ChevronDown, ChevronUp,
  Mail, Phone, MapPin, Send, CheckCircle2, Upload, X, HelpCircle
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
  },
  {
    question: "Bagaimana cara mengubah informasi profil atau email akun publisher?",
    answer: "Anda dapat memperbarui nama penerbit, foto profil, dan informasi kontak melalui menu Pengaturan Profil di dashboard Publisher.",
    category: "Masalah Akun"
  },
  {
    question: "Apa yang harus dilakukan jika lupa password akun publisher?",
    answer: "Gunakan opsi pemulihan password pada halaman masuk untuk menerima instruksi reset kata sandi melalui email Anda yang terdaftar.",
    category: "Masalah Akun"
  }
];

const faqCategories = [
  { icon: UploadCloud, title: 'Panduan Unggah', desc: 'Cara upload, format file, dan metadata' },
  { icon: FileText, title: 'Kebijakan Konten', desc: 'Hak cipta, konten terlarang, moderasi' },
  { icon: UserCog, title: 'Masalah Akun', desc: 'Login, keamanan, dan pengaturan profil' }
];

function PublisherLandingContent() {
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

  // Client-side real-time filter: Search text AND Category
  const filteredFaqs = faqs.filter(faq => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query === '' || 
      faq.question.toLowerCase().includes(query) || 
      faq.answer.toLowerCase().includes(query);
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
      <style>{`
        .pub-auth-left {
          display: flex;
          position: fixed;
          top: 50%;
          left: 48px;
          width: calc(50% - 96px);
          max-width: 480px;
          z-index: 20;
          flex-direction: column;
          justify-content: center;
          transition: all 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.1s;
        }

        .pub-auth-slide-panel {
          position: fixed;
          top: 0;
          right: 0;
          width: 50%;
          min-width: 380px;
          height: 100vh;
          background: #FFFFFF;
          z-index: 60;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 32px;
          overflow-y: auto;
          transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
        }

        .pub-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          text-align: center;
          gap: 24px;
        }

        .pub-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-right: 1px solid #F1F5F9;
        }

        .pub-stat-item:last-child {
          border-right: none;
        }

        /* FAQ Desktop Category Cards */
        .pub-faq-desktop-categories {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 48px;
        }

        /* FAQ Mobile Filter */
        .pub-faq-mobile-filter {
          display: none;
        }

        .pub-faq-card {
          border-radius: 20px;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pub-faq-accordion-header {
          padding: 24px 28px;
        }

        .pub-faq-accordion-body {
          padding: 0 28px 24px;
        }

        /* Kontak Layout Rules */
        .pub-kontak-section {
          width: 100%;
          background: #F8FAFC;
          padding: 48px 20px 80px;
        }

        .pub-kontak-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: start;
        }

        .pub-kontak-desktop-info {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .pub-kontak-mobile-quick {
          display: none;
        }

        .pub-kontak-form-card {
          background: #FFFFFF;
          border-radius: 24px;
          border: 1px solid #E2E8F0;
          padding: 36px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
        }

        @media (max-width: 1023px) {
          .pub-auth-left {
            display: none !important;
          }
          .pub-auth-slide-panel {
            width: 100% !important;
            min-width: 100% !important;
            padding: 64px 20px 36px !important;
            justify-content: flex-start !important;
          }
        }

        @media (max-width: 767px) {
          .pub-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .pub-stat-item {
            border-right: none !important;
            background: #F8FAFC !important;
            padding: 20px 12px !important;
            border-radius: 16px !important;
            border: 1px solid #F1F5F9 !important;
          }
          
          /* FAQ Mobile */
          .pub-faq-desktop-categories {
            display: none !important;
          }
          .pub-faq-mobile-filter {
            display: flex !important;
            flex-direction: column;
            margin-bottom: 20px;
          }
          .pub-faq-pill-row::-webkit-scrollbar {
            display: none;
          }
          .pub-faq-accordion-header {
            padding: 16px 18px !important;
          }
          .pub-faq-accordion-body {
            padding: 0 18px 18px !important;
          }

          /* Kontak Mobile Optimizations */
          .pub-kontak-section {
            padding: 20px 16px 48px !important;
          }
          .pub-kontak-grid {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            width: 100% !important;
            max-width: 480px !important;
            margin: 0 auto !important;
            gap: 0 !important;
          }
          .pub-kontak-desktop-info {
            display: none !important;
          }
          .pub-kontak-mobile-quick {
            display: block !important;
            width: 100% !important;
            margin-bottom: 14px !important;
          }
          .pub-kontak-form-card {
            width: 100% !important;
            padding: 22px 18px !important;
            border-radius: 20px !important;
          }
        }
      `}</style>
      
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
        className="pub-auth-left"
        style={{
          transform: isAuthPage ? 'translateY(-50%) translateX(0)' : 'translateY(-50%) translateX(-40px)',
          opacity: isAuthPage ? 1 : 0,
          pointerEvents: isAuthPage ? 'auto' : 'none',
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
        className="pub-auth-slide-panel"
        style={{
          boxShadow: isAuthPage ? '-20px 0 60px rgba(0,0,0,0.3)' : 'none',
          transform: isAuthPage ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Tombol Kembali ke Beranda (Pojok Kanan Atas) */}
        <button
          onClick={handleCloseAuth}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#64748B',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '999px',
            padding: '6px 14px',
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
        <div style={{ width: '100%', maxWidth: '420px', padding: '0 8px', marginTop: '12px' }}>
          
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
              padding: '0 20px',
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
              padding: '6px 16px',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#93C5FD',
              marginBottom: '20px',
              letterSpacing: '0.04em'
            }}>
              <Sparkles size={14} />
              PUBLISHER PORTAL PERPUSTAKAAN DIGITAL
            </div>

            <h1 
              style={{
                fontSize: 'clamp(2.25rem, 5.5vw, 4.25rem)',
                fontWeight: 900,
                color: '#FFFFFF',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                marginBottom: '20px',
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
                fontSize: 'clamp(0.938rem, 1.8vw, 1.25rem)',
                color: '#E2E8F0',
                maxWidth: '780px',
                margin: '0 auto 32px',
                lineHeight: 1.6,
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
                gap: '10px',
                background: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1.063rem',
                padding: '16px 36px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 0 35px rgba(37, 99, 235, 0.45)',
                transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
            >
              MULAI MENULIS
              <ArrowRight size={18} />
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
              padding: '0 20px',
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
              fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
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
              fontSize: '1rem',
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
              padding: '0 20px',
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
              fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
              fontWeight: 900,
              color: '#FFFFFF',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '16px',
            }}>
              Pertanyaan yang Sering Diajukan
            </h1>

            <p style={{
              fontSize: '1rem',
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
              padding: '0 20px',
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
              fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
              fontWeight: 900,
              color: '#FFFFFF',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '16px',
            }}>
              Mari Berkolaborasi Bersama
            </h1>

            <p style={{
              fontSize: '1rem',
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
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 20px', width: '100%' }}>
                  <div className="pub-stats-grid">
                    <div className="pub-stat-item">
                      <div style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, color: '#0F172A', lineHeight: 1, marginBottom: '6px' }}>50+</div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>MITRA INSTITUSI</div>
                    </div>
                    <div className="pub-stat-item">
                      <div style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, color: '#0F172A', lineHeight: 1, marginBottom: '6px' }}>100K+</div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>PEMBACA AKTIF</div>
                    </div>
                    <div className="pub-stat-item">
                      <div style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, color: '#0F172A', lineHeight: 1, marginBottom: '6px' }}>15K+</div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>KOLEKSI EBOOK</div>
                    </div>
                    <div className="pub-stat-item">
                      <div style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, color: '#0F172A', lineHeight: 1, marginBottom: '6px' }}>24/7</div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AKSES GLOBAL</div>
                    </div>
                  </div>
                </div>
              </section>

              <section style={{ width: '100%', background: '#F8FAFC', padding: '56px 20px 72px', textAlign: 'center' }}>
                <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>
                    Siap Memulai Langkah Anda?
                  </h2>
                  <p style={{ color: '#64748B', fontSize: '0.938rem', lineHeight: 1.6, marginBottom: '24px' }}>
                    Bergabunglah dengan ribuan penerbit lainnya untuk mendistribusikan karya terbaik Anda secara global.
                  </p>
                  <button 
                    onClick={() => handleOpenAuth('register')}
                    style={{
                      marginTop: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      justifyContent: 'center',
                      background: '#2563EB',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '1rem',
                      padding: '14px 36px',
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
            <div style={{ width: '100%', background: '#F8FAFC', padding: '48px 20px 80px' }}>
              <div style={{ maxWidth: '920px', margin: '0 auto', width: '100%' }}>
                
                {/* 1. DESKTOP 3 TOPIK CARDS (Hidden on mobile) */}
                <div className="pub-faq-desktop-categories">
                  {faqCategories.map((cat, idx) => {
                    const Icon = cat.icon;
                    const isSelected = selectedFaqCategory === cat.title;
                    return (
                      <div 
                        key={idx}
                        className="pub-faq-card"
                        onClick={() => setSelectedFaqCategory(isSelected ? null : cat.title)}
                        style={{
                          background: isSelected ? '#EFF6FF' : '#FFFFFF',
                          border: isSelected ? '2px solid #3B82F6' : '1px solid #E2E8F0',
                        }}
                      >
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          background: isSelected ? '#2563EB' : '#F1F5F9',
                          color: isSelected ? '#FFFFFF' : '#2563EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '16px'
                        }}>
                          <Icon size={22} />
                        </div>
                        <h3 style={{ fontSize: '1.063rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                          {cat.title}
                        </h3>
                        <p style={{ fontSize: '0.813rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                          {cat.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* 2. MOBILE FILTER: SEARCH BAR + HORIZONTAL SCROLLABLE PILLS ROW (Top priority visual) */}
                <div className="pub-faq-mobile-filter">
                  {/* Search Bar */}
                  <div style={{ position: 'relative', width: '100%', marginBottom: '14px' }}>
                    <div style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94A3B8',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <Search size={18} />
                    </div>
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari pertanyaan..."
                      style={{
                        width: '100%',
                        padding: '12px 38px 12px 42px',
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '14px',
                        fontSize: '0.938rem',
                        color: '#0F172A',
                        outline: 'none',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                      }}
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        aria-label="Hapus pencarian"
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: '#F1F5F9',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#64748B',
                          cursor: 'pointer'
                        }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Horizontal Scrollable Pills Row */}
                  <div 
                    className="pub-faq-pill-row"
                    style={{
                      display: 'flex',
                      gap: '8px',
                      overflowX: 'auto',
                      paddingBottom: '6px',
                      marginBottom: '10px',
                      WebkitOverflowScrolling: 'touch',
                      msOverflowStyle: 'none',
                      scrollbarWidth: 'none'
                    }}
                  >
                    {/* "Semua" Pill */}
                    <button
                      onClick={() => setSelectedFaqCategory(null)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        height: '42px',
                        padding: '0 16px',
                        borderRadius: '999px',
                        fontSize: '0.813rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        transition: 'all 0.15s ease',
                        background: selectedFaqCategory === null ? '#2563EB' : '#FFFFFF',
                        color: selectedFaqCategory === null ? '#FFFFFF' : '#475569',
                        border: selectedFaqCategory === null ? '1px solid #2563EB' : '1px solid #E2E8F0',
                        boxShadow: selectedFaqCategory === null ? '0 4px 12px rgba(37,99,235,0.25)' : 'none'
                      }}
                    >
                      <Sparkles size={14} />
                      <span>Semua ({faqs.length})</span>
                    </button>

                    {/* Category Pills with Real Dynamic Count */}
                    {faqCategories.map((cat, idx) => {
                      const Icon = cat.icon;
                      const isSelected = selectedFaqCategory === cat.title;
                      const count = faqs.filter(f => f.category === cat.title).length;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedFaqCategory(isSelected ? null : cat.title)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            height: '42px',
                            padding: '0 16px',
                            borderRadius: '999px',
                            fontSize: '0.813rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            transition: 'all 0.15s ease',
                            background: isSelected ? '#2563EB' : '#FFFFFF',
                            color: isSelected ? '#FFFFFF' : '#475569',
                            border: isSelected ? '1px solid #2563EB' : '1px solid #E2E8F0',
                            boxShadow: isSelected ? '0 4px 12px rgba(37,99,235,0.25)' : 'none'
                          }}
                        >
                          <Icon size={14} />
                          <span>{cat.title} ({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. FAQ ACCORDION LIST (Filtered) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((faq, index) => {
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
                            className="pub-faq-accordion-header"
                            onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                            style={{
                              width: '100%',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              textAlign: 'left'
                            }}
                          >
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: isOpen ? '#1D4ED8' : '#0F172A', paddingRight: '12px' }}>
                              {faq.question}
                            </span>
                            <span style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              background: isOpen ? '#EFF6FF' : '#F8FAFC',
                              color: isOpen ? '#2563EB' : '#64748B',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </span>
                          </button>
                          
                          {isOpen && (
                            <div className="pub-faq-accordion-body" style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.65 }}>
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    /* Empty State */
                    <div style={{
                      background: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      padding: '40px 20px',
                      textAlign: 'center',
                      color: '#64748B'
                    }}>
                      <HelpCircle size={40} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
                      <h4 style={{ fontSize: '1.063rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                        Tidak ada pertanyaan ditemukan
                      </h4>
                      <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '0 0 18px', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
                        Coba gunakan kata kunci pencarian lain atau ubah filter kategori.
                      </p>
                      <button
                        onClick={() => { setSearchQuery(''); setSelectedFaqCategory(null); }}
                        style={{
                          background: '#EFF6FF',
                          color: '#2563EB',
                          border: '1px solid #BFDBFE',
                          borderRadius: '10px',
                          padding: '8px 18px',
                          fontSize: '0.813rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        Reset Filter & Pencarian
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* KONTAK CONTENT */}
          {activePage === 'kontak' && (
            <div className="pub-kontak-section">
              <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
                <div className="pub-kontak-grid">
                  
                  {/* DESKTOP INFO COLUMN (Hidden on Mobile) */}
                  <div className="pub-kontak-desktop-info">
                    <div>
                      <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
                        Pusat Dukungan Mitra
                      </h2>
                      <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                        Ada pertanyaan mengenai kemitraan atau kendala sistem? Silakan hubungi kami melalui saluran berikut.
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#FFFFFF', padding: '14px 18px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Mail size={20} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.688rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Email Resmi</div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>support@perpustakaandigital.id</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#FFFFFF', padding: '14px 18px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Phone size={20} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.688rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Layanan Cepat</div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>+62 812-3456-7890</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#FFFFFF', padding: '14px 18px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#F8FAFC', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <MapPin size={20} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.688rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Lokasi Kantor</div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>Gedung Literasi Indonesia Lt. 5, Jakarta</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MOBILE QUICK CONTACT CHANNELS (Hidden on Desktop) */}
                  <div className="pub-kontak-mobile-quick">
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '10px',
                      width: '100%'
                    }}>
                      <a 
                        href="mailto:support@perpustakaandigital.id"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '16px 8px',
                          background: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: '16px',
                          textDecoration: 'none',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                          <Mail size={20} />
                        </div>
                        <span style={{ fontSize: '0.813rem', fontWeight: 800, color: '#0F172A', textAlign: 'center' }}>Email</span>
                        <span style={{ fontSize: '0.688rem', color: '#64748B', marginTop: '2px', textAlign: 'center' }}>1-tap kirim</span>
                      </a>

                      <a 
                        href="https://wa.me/6281234567890" 
                        target="_blank" 
                        rel="noreferrer"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '16px 8px',
                          background: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: '16px',
                          textDecoration: 'none',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                          <Phone size={20} />
                        </div>
                        <span style={{ fontSize: '0.813rem', fontWeight: 800, color: '#0F172A', textAlign: 'center' }}>WhatsApp</span>
                        <span style={{ fontSize: '0.688rem', color: '#64748B', marginTop: '2px', textAlign: 'center' }}>Respon cepat</span>
                      </a>

                      <div 
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '16px 8px',
                          background: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: '16px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F8FAFC', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                          <MapPin size={20} />
                        </div>
                        <span style={{ fontSize: '0.813rem', fontWeight: 800, color: '#0F172A', textAlign: 'center' }}>Kantor</span>
                        <span style={{ fontSize: '0.688rem', color: '#64748B', marginTop: '2px', textAlign: 'center' }}>Jakarta</span>
                      </div>
                    </div>
                  </div>

                  {/* Form Column */}
                  <div className="pub-kontak-form-card">
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>
                        Kirim Pesan Langsung
                      </h3>
                      <p style={{ fontSize: '0.813rem', color: '#64748B', margin: 0 }}>
                        Isi formulir di bawah dan kami akan segera membalas.
                      </p>
                    </div>

                    {contactSent ? (
                      <div style={{ padding: '24px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '16px', textAlign: 'center', color: '#065F46' }}>
                        <CheckCircle2 size={36} style={{ margin: '0 auto 12px', color: '#10B981' }} />
                        <h4 style={{ fontSize: '1.063rem', fontWeight: 800, margin: '0 0 6px' }}>Pesan Berhasil Terkirim!</h4>
                        <p style={{ fontSize: '0.875rem', margin: 0 }}>Tim kami akan segera menghubungi Anda kembali.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Nama Lengkap</label>
                          <input 
                            type="text" 
                            required 
                            value={contactForm.name}
                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                            placeholder="Nama Anda"
                            style={{ width: '100%', padding: '10px 14px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', fontSize: '0.875rem', outline: 'none' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Alamat Email</label>
                          <input 
                            type="email" 
                            required 
                            value={contactForm.email}
                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                            placeholder="email@domain.com"
                            style={{ width: '100%', padding: '10px 14px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', fontSize: '0.875rem', outline: 'none' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Subjek</label>
                          <input 
                            type="text" 
                            required 
                            value={contactForm.subject}
                            onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                            placeholder="Subjek pertanyaan"
                            style={{ width: '100%', padding: '10px 14px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', fontSize: '0.875rem', outline: 'none' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Pesan</label>
                          <textarea 
                            rows={3}
                            required 
                            value={contactForm.message}
                            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                            placeholder="Tuliskan pesan Anda..."
                            style={{ width: '100%', padding: '10px 14px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', fontSize: '0.875rem', outline: 'none', resize: 'none' }}
                          />
                        </div>

                        <button 
                          type="submit"
                          disabled={contactSubmitting}
                          style={{
                            width: '100%',
                            padding: '12px',
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
                            marginTop: '4px'
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

export default function PublisherLandingPage() {
  return (
    <Suspense fallback={null}>
      <PublisherLandingContent />
    </Suspense>
  );
}
