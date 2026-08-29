'use client';

import React, { useState } from 'react';
import { Search, Grid, User, BookOpen, Headphones, Settings, ShieldAlert, MessageCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface FAQComponentProps {
  type: 'visitor' | 'publisher';
}

const FAQComponent: React.FC<FAQComponentProps> = ({ type }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const visitorFAQs: FAQItem[] = [
    {
      question: 'Apakah saya wajib membuat akun untuk membaca buku?',
      answer: 'Tidak. Anda dapat mencari, melihat daftar, membaca, dan mengunduh ebook sepenuhnya tanpa perlu mendaftar atau login ke dalam sistem.',
      category: 'Pendaftaran'
    },
    {
      question: 'Bagaimana cara menemukan buku yang saya inginkan?',
      answer: 'Anda dapat menggunakan fitur pencarian dengan memasukkan kata kunci (judul atau nama penulis), serta menggunakan filter kategori untuk menyaring daftar ebook.',
      category: 'Koleksi & Akses'
    },
    {
      question: 'Apakah saya harus mengunduh aplikasi untuk membaca?',
      answer: 'Tidak perlu. Anda bisa menggunakan fitur "Baca Ebook di Web" untuk membaca langsung melalui browser perangkat Anda.',
      category: 'Layanan'
    },
    {
      question: 'Bisakah saya menyimpan buku untuk dibaca secara offline?',
      answer: 'Bisa. Buka halaman overview buku yang diinginkan, lalu klik tombol "Unduh PDF" untuk menyimpan file ke perangkat Anda.',
      category: 'Layanan'
    },
    {
      question: 'Apakah saya bisa membagikan buku ke teman?',
      answer: 'Ya. Tersedia fitur "Bagikan Ebook" pada halaman detail buku untuk menyalin tautan atau membagikannya langsung ke platform lain.',
      category: 'Koleksi & Akses'
    },
    {
      question: 'Bagaimana cara memberikan ulasan pada buku yang sudah dibaca?',
      answer: 'Anda dapat langsung menggunakan fitur "Beri Rating" yang tersedia di halaman overview buku untuk memberikan penilaian Anda.',
      category: 'Layanan'
    }
  ];

  const publisherFAQs: FAQItem[] = [
    {
      question: 'Bagaimana cara mulai mengunggah buku?',
      answer: 'Anda harus melakukan proses "Daftar / Login Publisher" terlebih dahulu. Setelah masuk ke dashboard, Anda dapat mulai mengunggah karya Anda.',
      category: 'Pendaftaran'
    },
    {
      question: 'Apakah buku yang saya unggah langsung bisa dibaca publik?',
      answer: 'Tidak. Setiap ebook yang baru diunggah akan berstatus Pending. File tersebut masuk ke antrean admin untuk proses tinjauan (Acc atau Reject). Buku baru akan tampil di halaman publik setelah disetujui admin.',
      category: 'Layanan'
    },
    {
      question: 'Apakah saya bisa mengubah detail atau menghapus buku saya?',
      answer: 'Tentu. Anda memiliki kontrol penuh untuk "Kelola Ebook Sendiri". Anda bisa memperbarui informasi, mengganti file, atau menghapus buku dari platform melalui dashboard Anda.',
      category: 'Manajemen'
    },
    {
      question: 'Bagaimana cara mengetahui jumlah pembaca buku saya?',
      answer: 'Anda dapat mengakses menu "Lihat Statistik Trafik" di dashboard publisher untuk memantau jumlah kunjungan dan performa setiap buku yang Anda unggah.',
      category: 'Manajemen'
    },
    {
      question: 'Apakah saya bisa mengubah informasi profil penerbit?',
      answer: 'Bisa. Gunakan menu "Kelola Profil" untuk memperbarui nama institusi, logo, atau deskripsi penerbit kapan saja.',
      category: 'Pendaftaran'
    },
    {
      question: 'Mengapa buku saya ditolak atau akun saya dibatasi?',
      answer: 'Admin memegang kontrol atas "Manajemen Publisher" dan peninjauan konten. Penolakan atau pemblokiran (Ban) biasanya terjadi jika unggahan melanggar pedoman kualitas, hak cipta, atau standar keamanan platform yang dipantau oleh admin.',
      category: 'Kebijakan'
    }
  ];

  const faqs = type === 'visitor' ? visitorFAQs : publisherFAQs;

  const categoriesVisitor = [
    { id: 'Semua', label: 'Semua', icon: Grid },
    { id: 'Pendaftaran', label: 'Pendaftaran', icon: User },
    { id: 'Koleksi & Akses', label: 'Koleksi & Akses', icon: BookOpen },
    { id: 'Layanan', label: 'Layanan', icon: Headphones },
  ];

  const categoriesPublisher = [
    { id: 'Semua', label: 'Semua', icon: Grid },
    { id: 'Pendaftaran', label: 'Pendaftaran', icon: User },
    { id: 'Manajemen', label: 'Manajemen', icon: Settings },
    { id: 'Layanan', label: 'Layanan', icon: Headphones },
    { id: 'Kebijakan', label: 'Kebijakan', icon: ShieldAlert },
  ];

  const categories = type === 'visitor' ? categoriesVisitor : categoriesPublisher;

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Semua' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Inter, sans-serif',
      paddingBottom: '80px'
    }}>
      <style>{`
        .faq-hover-elevate {
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .faq-hover-elevate:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          border-color: #BFDBFE !important;
        }
        
        .faq-btn-scale {
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .faq-btn-scale:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 16px -4px rgba(37, 99, 235, 0.3);
          background-color: #1D4ED8 !important;
        }

        .faq-filter-btn {
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .faq-filter-btn:hover:not(.active) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.08);
          background-color: #F8FAFC !important;
          border-color: #CBD5E1 !important;
        }

        .faq-search-wrap {
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .faq-search-wrap:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.08);
          border-color: #BFDBFE !important;
        }
      `}</style>

      {/* Decorative Blobs */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '-100px',
        width: '384px',
        height: '384px',
        backgroundColor: 'rgba(219, 234, 254, 0.5)',
        borderRadius: '50%',
        filter: 'blur(64px)',
        pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '500px',
        height: '500px',
        backgroundColor: 'rgba(239, 246, 255, 0.8)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        pointerEvents: 'none'
      }}></div>
      
      {/* Background Dots Pattern (subtle) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.03,
        pointerEvents: 'none',
        backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}></div>

      <div style={{
        maxWidth: '896px',
        margin: '0 auto',
        padding: '64px 24px 0',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 800,
            color: '#0F172A',
            marginBottom: '16px',
            letterSpacing: '-0.025em'
          }}>Pertanyaan yang Sering Diajukan</h1>
          <p style={{
            color: '#64748B',
            fontSize: '18px'
          }}>Temukan jawaban atas pertanyaan umum seputar layanan Perpustakaan Digital kami.</p>
        </div>

        {/* Search Bar */}
        <div className="faq-search-wrap" style={{
          position: 'relative',
          maxWidth: '672px',
          margin: '0 auto 40px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '16px',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none'
          }}>
            <Search color="#94A3B8" size={20} />
          </div>
          <input
            type="text"
            placeholder="Cari pertanyaan atau kata kunci..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              display: 'block',
              width: '100%',
              padding: '16px 16px 16px 44px',
              color: '#334155',
              fontSize: '16px',
              border: 'none',
              outline: 'none',
              background: 'transparent'
            }}
          />
        </div>

        {/* Categories */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '40px'
        }}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`faq-filter-btn ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: isActive ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                  backgroundColor: isActive ? '#EFF6FF' : '#FFFFFF',
                  color: isActive ? '#2563EB' : '#64748B',
                  boxShadow: isActive ? '0 4px 12px -2px rgba(37, 99, 235, 0.15)' : 'none',
                  transform: isActive ? 'translateY(-2px)' : 'none'
                }}
              >
                <Icon size={16} color={isActive ? '#2563EB' : '#94A3B8'} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* FAQ List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div 
                  key={index}
                  className={!isOpen ? "faq-hover-elevate" : ""}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: isOpen ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                    boxShadow: isOpen ? '0 10px 20px -5px rgba(37, 99, 235, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    overflow: 'hidden',
                    transform: isOpen ? 'translateY(-3px)' : 'none'
                  }}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    style={{
                      width: '100%',
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        flexShrink: 0,
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#EFF6FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2563EB',
                        fontWeight: 700,
                        fontSize: '16px'
                      }}>
                        ?
                      </div>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: isOpen ? '#1E40AF' : '#0F172A',
                        transition: 'color 0.2s'
                      }}>
                        {faq.question}
                      </span>
                    </div>
                    <div style={{ 
                      flexShrink: 0, 
                      marginLeft: '16px',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isOpen ? "#2563EB" : "#94A3B8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  </button>
                  
                  {isOpen && (
                    <div style={{ padding: '0 24px 24px 72px', animation: 'fadeIn 0.3s ease' }}>
                      <style>{`
                        @keyframes fadeIn {
                          from { opacity: 0; transform: translateY(-10px); }
                          to { opacity: 1; transform: translateY(0); }
                        }
                      `}</style>
                      <div style={{
                        color: '#475569',
                        lineHeight: 1.6,
                        fontSize: '15px'
                      }}>
                        {faq.answer}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '48px 0',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px dashed #CBD5E1'
            }}>
              <p style={{ color: '#64748B' }}>Tidak ada pertanyaan yang sesuai dengan pencarian Anda.</p>
            </div>
          )}
        </div>

        {/* Contact Banner */}
        <div style={{
          backgroundColor: '#F8FAFC',
          borderRadius: '16px',
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          background: 'linear-gradient(to right, #EFF6FF, #FFFFFF)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #DBEAFE',
              flexShrink: 0
            }}>
              <Headphones color="#2563EB" size={28} />
            </div>
            <div>
              <h3 style={{
                color: '#0F172A',
                fontWeight: 700,
                fontSize: '18px',
                marginBottom: '4px',
                marginTop: 0
              }}>Masih ada pertanyaan?</h3>
              <p style={{
                color: '#64748B',
                fontSize: '14px',
                margin: 0
              }}>Tim kami siap membantu Anda kapan saja.</p>
            </div>
          </div>
          <button className="faq-btn-scale" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: 500,
            fontSize: '16px',
            border: 'none',
            cursor: 'pointer'
          }}>
            <MessageCircle size={20} />
            Hubungi Kami
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQComponent;
