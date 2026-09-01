'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Search, BookOpen, BarChart3, Shield, Key, 
  ChevronDown, MessageSquare, Send, CheckCircle2, 
  ArrowRight, ArrowLeft, X, LifeBuoy, HelpCircle
} from 'lucide-react';
import { usePublisherI18n } from '@/lib/publisherI18n';

interface FAQItem {
  id: string;
  category: 'curation' | 'analytics' | 'account' | 'api';
  question: { id: string; en: string };
  answer: { id: string; en: string };
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'curation',
    question: {
      id: 'Mengapa ebook saya berada dalam status Pending Review dan berapa lama prosesnya?',
      en: 'Why is my ebook in Pending Review status and how long does the process take?'
    },
    answer: {
      id: 'Setiap karya yang diunggah melewati verifikasi kurator untuk memastikan kualitas file PDF, kelayakan cover (rasio 3:4), dan kepatuhan hak cipta. Proses moderasi berlangsung maksimal 1-2 hari kerja.',
      en: 'Every uploaded ebook undergoes curator verification to ensure PDF readability, cover quality (3:4 ratio), and copyright compliance. The moderation process takes 1-2 business days.'
    }
  },
  {
    id: 'faq-2',
    category: 'curation',
    question: {
      id: 'Format dan batasan file apa saja yang didukung oleh sistem?',
      en: 'What file formats and size limits are supported by the system?'
    },
    answer: {
      id: 'Kami mendukung format berkas digital PDF (hingga 50 MB) untuk naskah buku dan format gambar JPG/PNG (hingga 5 MB) dengan rasio 3:4 untuk sampul depan buku.',
      en: 'We support PDF digital files (up to 50 MB) for book contents and JPG/PNG image files (up to 5 MB) with a 3:4 aspect ratio for book covers.'
    }
  },
  {
    id: 'faq-3',
    category: 'analytics',
    question: {
      id: 'Kapan data analitik pembaca diperbarui?',
      en: 'When is readership analytics data updated?'
    },
    answer: {
      id: 'Statistik tayangan pembaca dicatat secara real-time ke database. Ringkasan performa dan grafik tren mingguan dikalkulasikan setiap hari pada pukul 00:00 WIB.',
      en: 'Readership metrics are logged in real-time. Performance summaries and weekly trend graphs are aggregated daily at 00:00 WIB.'
    }
  },
  {
    id: 'faq-4',
    category: 'account',
    question: {
      id: 'Bagaimana cara mengubah profil dan nama resmi penerbit?',
      en: 'How do I update publisher profile information and official name?'
    },
    answer: {
      id: 'Anda dapat memperbarui bio, nomor telepon, dan situs web resmi melalui menu Pengaturan > Tab Profil. Perubahan nama institusi besar memerlukan konfirmasi verifikasi dari tim Administrator.',
      en: 'You can update your bio, contact number, and official website via Settings > Profile Tab. Major institution name changes require verification from the Administrator.'
    }
  },
  {
    id: 'faq-5',
    category: 'api',
    question: {
      id: 'Bagaimana cara mengonfigurasi Webhook untuk sinkronisasi otomatis?',
      en: 'How do I configure Webhooks for automatic catalog synchronization?'
    },
    answer: {
      id: 'Buka menu Pengaturan > Tab API Keys & Webhook. Masukkan URL endpoint HTTPS server Anda. Sistem kami akan mengirimkan payload JSON setiap kali status kurasi buku berubah.',
      en: 'Navigate to Settings > API Keys & Webhook Tab. Enter your HTTPS endpoint URL. Our system will dispatch JSON payloads whenever a book curation status updates.'
    }
  },
  {
    id: 'faq-6',
    category: 'account',
    question: {
      id: 'Apakah hak cipta dan kepemilikan naskah tetap milik penerbit?',
      en: 'Do copyright and intellectual property remain with the publisher?'
    },
    answer: {
      id: 'Ya, 100% hak cipta dan hak kekayaan intelektual naskah tetap menjadi milik Anda secara penuh. Platform kami hanya bertindak sebagai media distribusi perpustakaan digital resmi.',
      en: 'Yes, 100% of copyright and IP rights remain solely with you. Our platform operates purely as an authorized digital library distribution system.'
    }
  }
];

export default function PublisherHelpPage() {
  const { lang } = usePublisherI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('curation');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard Shortcut: Ctrl+K / Cmd+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const categories = [
    {
      id: 'curation',
      icon: BookOpen,
      title: lang === 'en' ? 'Curation & Content' : 'Kurasi & Konten',
      desc: lang === 'en' ? 'PDF standards, cover guidelines (3:4 ratio), copyright policies & editorial moderation.' : 'Pedoman berkas PDF, standar cover (3:4), hak cipta, dan kepatuhan editorial.'
    },
    {
      id: 'analytics',
      icon: BarChart3,
      title: lang === 'en' ? 'Data & Analytics' : 'Analitik Data',
      desc: lang === 'en' ? 'Understanding reader metrics, completion rates, peak engagement hours, and view trends.' : 'Memahami metrik pembaca, waktu baca, performa tayangan, dan tren mingguan.'
    },
    {
      id: 'account',
      icon: Shield,
      title: lang === 'en' ? 'Account & Security' : 'Akun & Keamanan',
      desc: lang === 'en' ? 'Credentials management, active device sessions, danger zone, and institution verification.' : 'Pengelolaan kredensial login, sesi perangkat aktif, dan verifikasi institusi.'
    },
    {
      id: 'api',
      icon: Key,
      title: lang === 'en' ? 'API & Webhooks' : 'Integrasi API & Webhook',
      desc: lang === 'en' ? 'REST API documentation, webhook setup, and automated catalog synchronization.' : 'Dokumentasi REST API, integrasi webhook, dan sinkronisasi katalog otomatis.'
    }
  ];

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const qText = item.question[lang].toLowerCase();
    const aText = item.answer[lang].toLowerCase();
    const query = searchQuery.toLowerCase().trim();

    const matchesSearch = query === '' || qText.includes(query) || aText.includes(query);
    const matchesCategory = !selectedCategory || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    setIsSubmittingTicket(true);
    setTimeout(() => {
      setIsSubmittingTicket(false);
      setTicketSuccess(true);
      setTimeout(() => {
        setIsTicketModalOpen(false);
        setTicketSuccess(false);
        setTicketSubject('');
        setTicketMessage('');
      }, 1600);
    }, 800);
  };

  return (
    <div className="help-container" style={{ width: '100%', maxWidth: '1080px', margin: '0 auto', padding: '8px 8px 64px' }}>
      
      {/* Top Back Navigation */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link 
          href="/publisher"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.813rem',
            fontWeight: 700,
            color: '#64748B',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: '8px',
            background: '#F1F5F9',
            transition: 'all 0.15s ease'
          }}
        >
          <ArrowLeft size={14} />
          <span>{lang === 'en' ? 'Back to Publisher Portal' : 'Kembali ke Portal Publisher'}</span>
        </Link>
      </div>

      {/* 
        =======================================================
        CSS KHUSUS MOBILE UNTUK LAYOUT VERTIKAL & HEMAT RUANG 
        =======================================================
      */}
      <style>{`
        .pub-help-search-input { padding: 12px 75px 12px 44px; }
        .pub-help-badge-shortcut { display: flex; }
        
        @media (max-width: 768px) {
          /* Container Adjustments */
          .help-container { padding: 8px 16px 64px !important; }
          
          /* Hero Section Compression */
          .help-hero { padding: 24px 16px 20px !important; margin-bottom: 20px !important; }
          .help-hero-title { font-size: 1.35rem !important; margin-bottom: 6px !important; }
          .help-hero-subtitle { font-size: 0.8rem !important; margin-bottom: 16px !important; }
          
          /* Search Bar Adjustments */
          .pub-help-search-input { padding: 10px 16px 10px 40px !important; font-size: 0.813rem !important; }
          .pub-help-badge-shortcut { display: none !important; }
          
          /* 
             KUNCI UTAMA: Kategori di-Grid jadi 2 Kolom agar sangat hemat ruang
             dan tidak numpuk lurus memanjang ke bawah.
          */
          .help-category-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .help-category-card { padding: 12px !important; }
          .help-category-icon { width: 32px !important; height: 32px !important; margin-bottom: 8px !important; }
          .help-category-icon svg { width: 16px !important; height: 16px !important; }
          .help-category-title { font-size: 0.813rem !important; margin-bottom: 4px !important; }
          /* Potong deskripsi maks 2 baris agar ukuran card rapi & mungil */
          .help-category-desc { font-size: 0.7rem !important; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4 !important; }
          .help-category-footer { margin-top: 10px !important; padding-top: 8px !important; font-size: 0.7rem !important; }
          
          /* FAQ Section Compression */
          .help-faq-section { padding: 20px 16px !important; margin-bottom: 20px !important; }
          .help-faq-title { font-size: 1.15rem !important; }
          .help-faq-btn { padding: 12px 14px !important; gap: 10px !important; }
          .help-faq-btn span { font-size: 0.813rem !important; }
          .help-faq-content { padding: 10px 14px 14px !important; font-size: 0.75rem !important; }
          
          /* Support Ticket Box Compression */
          .help-support-box { padding: 24px 16px !important; }
          .help-support-box h3 { font-size: 1rem !important; }
          .help-support-box p { font-size: 0.75rem !important; margin-bottom: 16px !important; }
          
          /* Modal Overlay Compression */
          .ticket-modal-card { padding: 20px !important; max-width: 90% !important; }
        }
      `}</style>

      {/* 1. HERO SECTION & SEARCH BAR */}
      <div className="help-hero" style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        padding: '36px 20px 32px',
        textAlign: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        marginBottom: '28px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        
        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '99px',
          background: '#EFF6FF',
          border: '1px solid #DBEAFE',
          color: '#2563EB',
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '12px'
        }}>
          <LifeBuoy size={14} color="#2563EB" />
          <span>{lang === 'en' ? 'Publisher Help Desk' : 'Pusat Bantuan Penerbit'}</span>
        </div>

        {/* Title */}
        <h1 className="help-hero-title" style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: '#0F172A',
          letterSpacing: '-0.02em',
          margin: '0 0 8px',
          lineHeight: 1.25
        }}>
          {lang === 'en' ? 'Help Center & Documentation' : 'Pusat Bantuan & Dokumentasi'}
        </h1>

        {/* Subtitle */}
        <p className="help-hero-subtitle" style={{
          fontSize: '0.875rem',
          color: '#64748B',
          maxWidth: '540px',
          margin: '0 auto 24px',
          lineHeight: 1.5
        }}>
          {lang === 'en'
            ? 'Technical and operational guidance to maximize your digital publishing ecosystem.'
            : 'Panduan teknis dan operasional untuk memaksimalkan ekosistem penerbitan Anda.'}
        </p>

        {/* Search Bar */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '540px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            position: 'absolute',
            left: '16px',
            color: '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none'
          }}>
            <Search size={18} />
          </div>

          <input
            ref={searchInputRef}
            type="text"
            className="pub-help-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'en' ? 'Search topics, curation guides, API...' : 'Cari topik, panduan kurasi, integrasi API...'}
            style={{
              width: '100%',
              fontSize: '0.875rem',
              color: '#0F172A',
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: '12px',
              outline: 'none',
              transition: 'all 0.15s ease',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.borderColor = '#2563EB';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.15)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = '#F8FAFC';
              e.currentTarget.style.borderColor = '#CBD5E1';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />

          <div 
            className="pub-help-badge-shortcut"
            style={{
              position: 'absolute',
              right: '12px',
              pointerEvents: 'none',
              alignItems: 'center'
            }}
          >
            <span style={{
              fontSize: '0.688rem',
              fontWeight: 700,
              fontFamily: 'monospace',
              color: '#64748B',
              background: '#E2E8F0',
              padding: '3px 7px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1'
            }}>
              Ctrl K
            </span>
          </div>
        </div>

      </div>

      {/* 2. KNOWLEDGE BASE CATEGORIES (GRID COMPRESSED IN MOBILE) */}
      <div style={{ marginBottom: '36px' }}>
        <div className="help-category-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '16px'
        }}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                className="help-category-card"
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: isSelected ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                  padding: '20px',
                  boxShadow: isSelected ? '0 4px 14px rgba(37,99,235,0.12)' : '0 1px 3px rgba(0,0,0,0.02)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#93C5FD';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                  }
                }}
              >
                <div>
                  <div className="help-category-icon" style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: isSelected ? '#2563EB' : '#EFF6FF',
                    color: isSelected ? '#FFFFFF' : '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '14px',
                    transition: 'all 0.15s ease'
                  }}>
                    <Icon size={20} />
                  </div>

                  <h3 className="help-category-title" style={{
                    fontSize: '0.938rem',
                    fontWeight: 800,
                    color: '#0F172A',
                    margin: '0 0 6px'
                  }}>
                    {cat.title}
                  </h3>

                  <p className="help-category-desc" style={{
                    fontSize: '0.781rem',
                    color: '#64748B',
                    margin: 0,
                    lineHeight: 1.5
                  }}>
                    {cat.desc}
                  </p>
                </div>

                <div className="help-category-footer" style={{
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#2563EB'
                }}>
                  <span>{isSelected ? (lang === 'en' ? 'Filter Active' : 'Filter Aktif') : (lang === 'en' ? 'View Articles' : 'Lihat Topik')}</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            );
          })}
        </div>

        {selectedCategory && (
          <div style={{
            marginTop: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            color: '#1E40AF',
            padding: '10px 16px',
            borderRadius: '12px',
            fontSize: '0.813rem',
            fontWeight: 600
          }}>
            <span>{lang === 'en' ? 'Showing questions filtered by selected category' : 'Menampilkan topik khusus kategori terpilih'}</span>
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                background: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              {lang === 'en' ? 'Reset Filter' : 'Reset Filter'}
            </button>
          </div>
        )}
      </div>

      {/* 3. FAQ SECTION */}
      <div className="help-faq-section" style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        padding: '32px 28px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        marginBottom: '28px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 className="help-faq-title" style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0 0 6px',
            letterSpacing: '-0.01em'
          }}>
            {lang === 'en' ? 'Frequently Asked Questions' : 'Pertanyaan Seputar Operasional'}
          </h2>
          <p style={{
            fontSize: '0.813rem',
            color: '#64748B',
            margin: 0
          }}>
            {lang === 'en' ? 'Quick answers to common questions about publishing, analytics, and integrations.' : 'Jawaban cepat untuk pertanyaan teknis, verifikasi berkas, dan operasional.'}
          </p>
        </div>

        {filteredFaqs.length === 0 ? (
          <div style={{
            padding: '36px 16px',
            textAlign: 'center',
            color: '#64748B'
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔍</div>
            <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem', marginBottom: '4px' }}>
              {lang === 'en' ? 'No matching questions found' : 'Tidak ada pertanyaan yang sesuai'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '14px' }}>
              {lang === 'en' ? 'Try adjusting your search terms.' : 'Coba sesuaikan kata kunci pencarian Anda.'}
            </div>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
              style={{
                padding: '6px 14px',
                background: '#0F172A',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {lang === 'en' ? 'Clear Search' : 'Bersihkan Pencarian'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  style={{
                    background: '#FFFFFF',
                    border: isOpen ? '1px solid #93C5FD' : '1px solid #E2E8F0',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <button
                    className="help-faq-btn"
                    onClick={() => toggleFaq(faq.id)}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      background: isOpen ? '#F8FAFC' : '#FFFFFF',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '14px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: isOpen ? '#1D4ED8' : '#0F172A',
                      lineHeight: 1.4
                    }}>
                      {faq.question[lang]}
                    </span>

                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: isOpen ? '#EFF6FF' : '#F1F5F9',
                      color: isOpen ? '#2563EB' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}>
                      <ChevronDown size={14} />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="help-faq-content" style={{
                      padding: '12px 18px 16px',
                      fontSize: '0.813rem',
                      color: '#475569',
                      lineHeight: 1.6,
                      background: '#FAFAFA',
                      borderTop: '1px solid #F1F5F9'
                    }}>
                      {faq.answer[lang]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. SUPPORT ESCALATION (TICKET BOX) */}
      <div className="help-support-box" style={{
        background: 'linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 100%)',
        borderRadius: '20px',
        border: '1px solid #DBEAFE',
        padding: '36px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: '#2563EB',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '14px',
          boxShadow: '0 4px 10px rgba(37,99,235,0.25)'
        }}>
          <MessageSquare size={20} />
        </div>

        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: 800,
          color: '#0F172A',
          margin: '0 0 6px'
        }}>
          {lang === 'en' ? 'Still experiencing technical issues?' : 'Masih mengalami kendala teknis?'}
        </h3>

        <p style={{
          fontSize: '0.813rem',
          color: '#475569',
          maxWidth: '460px',
          margin: '0 auto 20px',
          lineHeight: 1.5
        }}>
          {lang === 'en'
            ? 'Our technical support team is ready to assist with publishing pipelines, curation questions, or API webhooks.'
            : 'Tim teknis kami siap membantu verifikasi naskah, kendala akun, maupun integrasi API dalam waktu kurang dari 24 jam.'}
        </p>

        <button
          onClick={() => setIsTicketModalOpen(true)}
          style={{
            background: '#2563EB',
            color: '#FFFFFF',
            fontSize: '0.813rem',
            fontWeight: 700,
            padding: '10px 22px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#1D4ED8'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#2563EB'}
        >
          <Send size={14} />
          <span>{lang === 'en' ? 'Create Support Ticket' : 'Buat Tiket Dukungan'}</span>
        </button>
      </div>

      {/* 5. TICKET SUBMISSION MODAL */}
      {isTicketModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div className="ticket-modal-card" style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            maxWidth: '480px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
            position: 'relative'
          }}>
            
            <button
              onClick={() => setIsTicketModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={18} />
            </button>

            {ticketSuccess ? (
              <div style={{ padding: '24px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px'
                }}>
                  <CheckCircle2 size={26} />
                </div>
                <h4 style={{ fontSize: '1.063rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                  {lang === 'en' ? 'Ticket Submitted Successfully' : 'Tiket Berhasil Diajukan'}
                </h4>
                <p style={{ fontSize: '0.813rem', color: '#64748B', margin: 0 }}>
                  {lang === 'en' ? 'Our support engineer will contact your registered email shortly.' : 'Tim dukungan kami akan merespons melalui email resmi penerbit Anda.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Send size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      {lang === 'en' ? 'New Support Ticket' : 'Tiket Dukungan Baru'}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
                      {lang === 'en' ? 'Direct escalation to library tech engineers.' : 'Eskalasi langsung ke tim teknis Digital Library.'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {lang === 'en' ? 'Issue Category' : 'Kategori Kendala'}
                  </label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.813rem',
                      fontWeight: 600,
                      color: '#0F172A',
                      background: '#FFFFFF',
                      outline: 'none'
                    }}
                  >
                    <option value="curation">{lang === 'en' ? 'Curation & Book Approval' : 'Kurasi & Persetujuan Buku'}</option>
                    <option value="analytics">{lang === 'en' ? 'Readership Analytics' : 'Metrik & Analitik Pembaca'}</option>
                    <option value="account">{lang === 'en' ? 'Account & Security' : 'Akun & Keamanan Akses'}</option>
                    <option value="api">{lang === 'en' ? 'API & Webhooks' : 'Integrasi REST API & Webhook'}</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {lang === 'en' ? 'Subject / Issue Summary' : 'Subjek / Ringkasan Kendala'}
                  </label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder={lang === 'en' ? 'e.g. Curation delay for ISBN #978...' : 'Contoh: Kendala verifikasi berkas PDF...'}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.813rem',
                      color: '#0F172A',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {lang === 'en' ? 'Detailed Description' : 'Deskripsi Lengkap Kendala'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder={lang === 'en' ? 'Describe the issue or steps to reproduce...' : 'Jelaskan secara detail permasalahan yang Anda alami...'}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.813rem',
                      color: '#0F172A',
                      outline: 'none',
                      resize: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setIsTicketModalOpen(false)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      background: '#FFFFFF',
                      fontSize: '0.813rem',
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    {lang === 'en' ? 'Cancel' : 'Batalkan'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingTicket}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#2563EB',
                      fontSize: '0.813rem',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      cursor: isSubmittingTicket ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 1px 3px rgba(37,99,235,0.2)'
                    }}
                  >
                    {isSubmittingTicket ? (
                      <>
                        <div style={{ width: '12px', height: '12px', border: '2px solid #FFFFFF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                        <span>{lang === 'en' ? 'Sending...' : 'Mengirim...'}</span>
                      </>
                    ) : (
                      <span>{lang === 'en' ? 'Submit Ticket' : 'Kirim Tiket'}</span>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}