'use client';

import { useState, useEffect, useRef } from 'react';
import { Link as LinkIcon, BookOpen, ArrowLeft, Edit2, Star, X, Landmark, Upload, Info, Check, Image as ImageIcon, Camera, Globe, Mail } from 'lucide-react';
import Link from 'next/link';

interface PublisherProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  bio?: string;
  website?: string;
  banner?: string | null; 
}

interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string | null;
}

export default function PublisherProfilePage() {
  const [profile, setProfile] = useState<PublisherProfile | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const fetchProfileAndBooks = async () => {
    const token = localStorage.getItem('publisher_token');
    if (!token) return;
    try {
      const [resProfile, resBooks] = await Promise.all([
        fetch('/api/publisher/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/publisher/books', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const jProfile = await resProfile.json();
      const jBooks = await resBooks.json();
      
      if (jProfile.success) {
        setProfile(jProfile.data);
        setName(jProfile.data.name || '');
        setAvatarPreview(jProfile.data.avatar);
        setBio(jProfile.data.bio || '');
        setWebsite(jProfile.data.website ? jProfile.data.website.replace(/^https?:\/\//, '') : '');
        setBannerPreview(jProfile.data.banner || null);
      }
      
      if (jBooks.success) {
        setBooks(jBooks.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndBooks();
  }, []);

  // Kunci scroll halaman ketika modal terbuka
  useEffect(() => {
    if (isEditing) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isEditing]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });
    const token = localStorage.getItem('publisher_token');

    try {
      const fullWebsite = website.trim() ? (website.startsWith('http') ? website : `https://${website.trim()}`) : '';
      const formData = new FormData();
      formData.append('name', name);
      formData.append('bio', bio);
      formData.append('website', fullWebsite);
      if (avatarFile) formData.append('avatar', avatarFile);
      if (bannerFile) formData.append('banner', bannerFile); 

      const res = await fetch('/api/publisher/profile', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const j = await res.json();
      if (j.success) {
        setProfile(j.data); 
        localStorage.setItem('publisher_user', JSON.stringify(j.data));
        window.dispatchEvent(new Event('storage'));
        setIsEditing(false);
      } else {
        setMessage({ text: j.error || 'Gagal menyimpan profil', type: 'error' });
      }
    } catch (e) {
      setMessage({ text: 'Terjadi kesalahan jaringan', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* MOBILE VIEW OPTIMIZATIONS (Max Width 768px) */
        @media (max-width: 768px) {
          /* Container & Header */
          .profile-container { padding: 12px 16px 24px !important; }
          .back-link { margin-bottom: 16px !important; }

          /* Profile Card */
          .profile-card { 
            display: flex !important;
            flex-direction: column !important;
            padding: 24px 16px 20px !important; 
            border-radius: 20px !important; 
            margin-bottom: 24px !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03) !important;
            border: 1px solid #F1F5F9 !important;
          }
          
          .profile-header-content { 
            order: 1 !important;
            flex-direction: column !important; 
            align-items: center !important; 
            text-align: center !important; 
            gap: 12px !important; 
          }
          
          .profile-avatar-wrapper { 
            width: 84px !important; 
            height: 84px !important; 
            font-size: 1.5rem !important; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
          }
          
          .profile-details { 
            display: flex !important; 
            flex-direction: column !important; 
            align-items: center !important; 
            min-width: 100% !important; 
          }
          
          .profile-title { 
            font-size: 1.5rem !important; 
            margin-bottom: 6px !important; 
            letter-spacing: -0.01em !important;
          }
          
          .profile-stats { 
            justify-content: center !important; 
            margin-bottom: 12px !important; 
            gap: 10px !important; 
          }
          
          .profile-bio { 
            text-align: center !important; 
            font-size: 0.875rem !important; 
            padding: 0 8px !important; 
            line-height: 1.5 !important;
          }
          
          /* Edit Button in Mobile - Look like a premium native app button */
          .btn-edit-profile { 
            order: 2 !important;
            position: relative !important; 
            top: auto !important; 
            right: auto !important; 
            width: 100% !important; 
            justify-content: center !important; 
            margin-top: 20px !important; 
            padding: 10px !important;
            font-size: 0.875rem !important;
            font-weight: 700 !important;
            border-radius: 12px !important;
            background: #F1F5F9 !important;
            color: #0F172A !important;
            border: none !important;
            transition: background 0.2s !important;
          }
          .btn-edit-profile:active {
            background: #E2E8F0 !important;
          }

          /* Book Grid */
          .book-collection-header { 
            flex-direction: row !important; 
            align-items: center !important; 
            justify-content: space-between !important; 
            margin-bottom: 16px !important; 
          }
          .book-collection-header h2 { font-size: 1.063rem !important; }
          .book-collection-header span { font-size: 0.75rem !important; }
          
          .book-grid { 
            grid-template-columns: repeat(2, 1fr) !important; 
            gap: 12px !important; 
          }
          
          .book-grid > div { 
            padding: 10px !important; 
            border-radius: 14px !important; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.03) !important;
          }
          
          .book-grid h3 { font-size: 0.813rem !important; margin-bottom: 4px !important; }
          .book-grid p { font-size: 0.688rem !important; }

          /* Modal Adjustments - Bottom Sheet Style */
          .modal-container { 
            padding: 0 !important; 
            align-items: flex-end !important; 
          }
          .modal-card { 
            max-height: 92vh !important; 
            border-radius: 24px 24px 0 0 !important; 
            width: 100% !important;
          }
          .modal-header { 
            padding: 20px 20px 16px !important; 
          }
          .modal-body { 
            grid-template-columns: 1fr !important; 
            gap: 24px !important; 
            padding: 16px 20px 24px !important; 
          }
          .modal-footer { 
            padding: 16px 20px 24px !important; 
            flex-direction: column-reverse !important; 
            gap: 12px !important; 
            justify-content: stretch !important;
          }
          .modal-footer button { 
            width: 100% !important; 
            justify-content: center !important; 
            padding: 14px !important; 
            font-size: 0.938rem !important;
            font-weight: 700 !important;
          }
        }
      `}</style>

      <div className="profile-container" style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Tombol Navigasi Kembali */}
        <div className="back-link" style={{ marginBottom: '20px' }}>
          <Link 
            href="/publisher/dashboard" 
            style={{ 
              fontSize: '0.813rem', 
              fontWeight: 700, 
              color: '#64748B', 
              textDecoration: 'none', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px',
              transition: 'color 0.15s ease'
            }}
          >
            <ArrowLeft size={16} /> Kembali ke Dashboard
          </Link>
        </div>

        {/* ==========================================
            PROFILE CARD (READ-ONLY VIEW)
            ========================================== */}
        <div className="profile-card" style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.02)',
          position: 'relative',
          overflow: 'hidden',
          padding: '36px',
          marginBottom: '32px'
        }}>
          
          {/* Banner Cover */}
          {profile?.banner && (
            <div style={{ position: 'absolute', inset: 0, height: '140px', width: '100%', opacity: 0.15 }}>
              <img src={profile.banner} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, #FFFFFF)' }} />
            </div>
          )}

          {/* Edit Button */}
          <button 
            onClick={() => {
              setIsEditing(true);
              setMessage({ text: '', type: '' });
            }}
            className="btn-outline btn-edit-profile"
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              padding: '8px 16px',
              borderRadius: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.813rem',
              cursor: 'pointer',
              zIndex: 10,
              background: '#FFFFFF',
              border: '1px solid #E2E8F0'
            }}
            title="Edit Profil Institusi"
          >
            <Edit2 size={14} /> Edit Profil
          </button>
          
          {/* Profile Content */}
          <div className="profile-header-content" style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
            
            {/* Avatar */}
            <div className="profile-avatar-wrapper" style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              background: '#0F172A',
              color: '#FFFFFF',
              border: '3px solid #FFFFFF',
              boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 800,
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {profile?.avatar ? (
                <img src={profile.avatar} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                profile?.name.charAt(0).toUpperCase() || 'P'
              )}
            </div>
            
            {/* Details */}
            <div className="profile-details" style={{ flex: 1, minWidth: '280px' }}>
              <h1 className="profile-title" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
                {profile?.name}
              </h1>
              
              <div className="profile-stats" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 10px',
                  background: '#EFF6FF',
                  color: '#2563EB',
                  border: '1px solid #DBEAFE',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  <BookOpen size={13} />
                  {books.length} Ebook Diterbitkan
                </span>

                <span style={{ fontSize: '0.813rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Mail size={14} color="#94A3B8" /> {profile?.email}
                </span>
              </div>

              {profile?.bio && (
                <p className="profile-bio" style={{ fontSize: '0.938rem', color: '#475569', lineHeight: 1.6, margin: '0 0 16px', maxWidth: '640px' }}>
                  {profile.bio}
                </p>
              )}

              {profile?.website && (
                <div>
                  <a 
                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.813rem',
                      fontWeight: 700,
                      color: '#2563EB',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      textDecoration: 'none'
                    }}
                  >
                    <Globe size={13} /> {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ==========================================
            KOLEKSI EBOOK PENERBIT
            ========================================== */}
        <div>
          <div className="book-collection-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Koleksi Ebook Anda</h2>
            <span style={{ fontSize: '0.813rem', color: '#64748B', fontWeight: 600 }}>{books.length} Karya Terdaftar</span>
          </div>
          
          {books.length > 0 ? (
            <div className="book-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
              {books.map((book) => (
                <div 
                  key={book.id} 
                  style={{
                    background: '#FFFFFF',
                    padding: '12px',
                    borderRadius: '14px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '3/4',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: '#F8FAFC',
                    border: '1px solid #F1F5F9',
                    marginBottom: '10px'
                  }}>
                    {book.coverImage ? (
                      <img src={book.coverImage} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '0.75rem' }}>
                        No Cover
                      </div>
                    )}
                  </div>
                  <h3 style={{ fontSize: '0.813rem', fontWeight: 700, color: '#0F172A', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {book.title}
                  </h3>
                  <p style={{ fontSize: '0.688rem', color: '#64748B', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {book.author}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '2px dashed #E2E8F0',
              padding: '48px 24px',
              textAlign: 'center'
            }}>
              <BookOpen size={36} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '0.938rem', fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>Belum ada koleksi buku</h3>
              <p style={{ fontSize: '0.813rem', color: '#64748B', margin: 0 }}>Ebook yang Anda terbitkan akan muncul di etalase publik ini.</p>
            </div>
          )}
        </div>

        {/* ==========================================
            OVERLAY & MODAL EDIT PROFIL (ENTERPRISE SAAS)
            ========================================== */}
        {isEditing && (
          <div 
            className="modal-container"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px'
            }}
            onClick={() => setIsEditing(false)}
          >
            
            {/* Modal Card Container */}
            <div 
              className="modal-card"
              style={{
                width: '100%',
                maxWidth: '860px',
                maxHeight: '90vh',
                background: '#FFFFFF',
                borderRadius: '20px',
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* 1. HEADER MODAL (STICKY TOP) */}
              <div className="modal-header" style={{
                padding: '20px 28px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#FFFFFF',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#EFF6FF',
                    color: '#2563EB',
                    border: '1px solid #DBEAFE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Landmark size={20} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
                      Edit Profil Institusi
                    </h2>
                    <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '2px 0 0' }}>
                      Kelola detail etalase publik dan informasi legalitas penerbit
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setIsEditing(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    color: '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Tutup Modal"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Error / Status Message */}
              {message.text && (
                <div style={{ padding: '16px 28px 0', flexShrink: 0 }}>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                    color: message.type === 'success' ? '#059669' : '#DC2626',
                    border: `1px solid ${message.type === 'success' ? '#A7F3D0' : '#FECACA'}`
                  }}>
                    {message.text}
                  </div>
                </div>
              )}

              {/* 2. BODY MODAL (AREA SCROLL & 2-COLUMN GRID) */}
              <div className="modal-body" style={{
                flex: 1,
                overflowY: 'auto',
                padding: '28px',
                background: '#FFFFFF',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '32px'
              }}>
                
                {/* KOLOM KIRI: UPLOAD GAMBAR */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Area Sampul */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                      Sampul Profil (Banner)
                    </label>
                    <div 
                      onClick={() => bannerInputRef.current?.click()}
                      style={{
                        border: '2px dashed #CBD5E1',
                        borderRadius: '12px',
                        aspectRatio: '16/9',
                        width: '100%',
                        background: '#F8FAFC',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {bannerPreview ? (
                        <>
                          <img src={bannerPreview} alt="Sampul" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0,0,0,0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.2s'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}
                          >
                            <span style={{ background: '#FFFFFF', color: '#0F172A', fontSize: '0.75rem', fontWeight: 700, padding: '6px 12px', borderRadius: '6px' }}>
                              Ganti Sampul
                            </span>
                          </div>
                        </>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '16px', color: '#64748B' }}>
                          <ImageIcon size={24} color="#94A3B8" style={{ margin: '0 auto 6px' }} />
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A' }}>Upload Sampul</div>
                          <div style={{ fontSize: '0.688rem', color: '#94A3B8' }}>Rasio 16:9 • Maks 2MB</div>
                        </div>
                      )}
                    </div>
                    <input type="file" accept="image/*" ref={bannerInputRef} onChange={handleBannerChange} style={{ display: 'none' }} />
                  </div>

                  {/* Area Logo */}
                  <div style={{ textAlign: 'center' }}>
                    <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                      Logo Institusi (1:1)
                    </label>
                    <div style={{ position: 'relative', width: '110px', height: '110px', margin: '0 auto' }}>
                      <div style={{
                        width: '110px',
                        height: '110px',
                        borderRadius: '50%',
                        background: '#0F172A',
                        color: '#FFFFFF',
                        border: '2px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                      }}>
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>{name.charAt(0).toUpperCase() || 'P'}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          position: 'absolute',
                          bottom: '2px',
                          right: '2px',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#2563EB',
                          color: '#FFFFFF',
                          border: '2px solid #FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(37,99,235,0.4)'
                        }}
                        title="Ganti Logo"
                      >
                        <Camera size={14} />
                      </button>
                    </div>

                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563EB',
                        fontSize: '0.813rem',
                        fontWeight: 700,
                        marginTop: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      Ganti Logo
                    </button>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} style={{ display: 'none' }} />
                  </div>

                  {/* Tips Box */}
                  <div style={{
                    background: '#EFF6FF',
                    border: '1px solid #DBEAFE',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    fontSize: '0.75rem',
                    color: '#1E40AF',
                    lineHeight: 1.5,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}>
                    <Info size={16} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ display: 'block', color: '#1E3A8A', marginBottom: '2px' }}>Rekomendasi Format:</strong>
                      Gunakan logo berlatar transparan (PNG) dan sampul beresolusi tinggi untuk etalase terbaik.
                    </div>
                  </div>

                </div>

                {/* KOLOM KANAN: FORM DATA */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  
                  {/* Nama Tampilan */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Nama Tampilan Institusi
                    </label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '10px',
                        fontSize: '0.875rem',
                        color: '#0F172A',
                        outline: 'none',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                      }}
                      placeholder="Nama institusi atau penerbit" 
                    />
                  </div>

                  {/* Bio Singkat */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Bio Singkat
                    </label>
                    <div style={{ position: 'relative' }}>
                      <textarea 
                        value={bio} 
                        onChange={(e) => setBio(e.target.value.slice(0, 160))} 
                        rows={4} 
                        style={{
                          width: '100%',
                          padding: '10px 14px 28px',
                          background: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          borderRadius: '10px',
                          fontSize: '0.875rem',
                          color: '#0F172A',
                          outline: 'none',
                          resize: 'none',
                          lineHeight: 1.5,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                        }}
                        placeholder="Deskripsikan fokus publikasi, sejarah singkat, atau visi literasi Anda..." 
                      />
                      <span style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '12px',
                        fontSize: '0.688rem',
                        fontWeight: 700,
                        color: '#94A3B8',
                        background: '#FFFFFF',
                        padding: '0 4px'
                      }}>
                        {bio.length}/160
                      </span>
                    </div>
                  </div>

                  {/* Tautan Eksternal */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Tautan Eksternal (Website)
                    </label>
                    <div style={{ display: 'flex', borderRadius: '10px', overflow: 'hidden', border: '1px solid #CBD5E1', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                      <span style={{
                        padding: '10px 14px',
                        background: '#F8FAFC',
                        borderRight: '1px solid #CBD5E1',
                        color: '#64748B',
                        fontSize: '0.813rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        https://
                      </span>
                      <input 
                        type="text" 
                        value={website} 
                        onChange={(e) => setWebsite(e.target.value)} 
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          background: '#FFFFFF',
                          border: 'none',
                          fontSize: '0.875rem',
                          color: '#0F172A',
                          outline: 'none',
                          width: '100%'
                        }}
                        placeholder="penerbit-resmi.id" 
                      />
                    </div>
                  </div>

                  {/* Info Akun Terkait */}
                  <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '12px 14px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.688rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '2px' }}>
                      Email Akun Terdaftar
                    </div>
                    <div style={{ fontSize: '0.813rem', fontWeight: 700, color: '#334155' }}>
                      {profile?.email}
                    </div>
                  </div>

                </div>

              </div>

              {/* 3. FOOTER MODAL (STICKY BOTTOM - ACTION BAR) */}
              <div className="modal-footer" style={{
                padding: '16px 28px',
                background: '#F8FAFC',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                flexShrink: 0
              }}>
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)} 
                  disabled={saving}
                  className="btn-outline"
                  style={{
                    padding: '9px 18px',
                    borderRadius: '10px',
                    fontSize: '0.813rem',
                    cursor: 'pointer',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    color: '#64748B'
                  }}
                >
                  Batal
                </button>
                
                <button 
                  type="button"
                  onClick={handleSave} 
                  disabled={saving || !name.trim()} 
                  className="btn-primary"
                  style={{
                    padding: '9px 20px',
                    borderRadius: '10px',
                    fontSize: '0.813rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: (saving || !name.trim()) ? 'not-allowed' : 'pointer',
                    opacity: (saving || !name.trim()) ? 0.6 : 1,
                    boxShadow: '0 1px 3px rgba(37,99,235,0.3)',
                    background: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none'
                  }}
                >
                  <Check size={15} strokeWidth={2.5} />
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </>
  );
}