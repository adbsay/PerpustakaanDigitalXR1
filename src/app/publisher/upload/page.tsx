'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormData {
  title: string;
  author: string;
  categoryId: string;
  description: string;
  tags: string;
  pdfFile: File | null;
  coverImage: File | null;
}

export default function UploadPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    title: '', author: '', categoryId: '', description: '', tags: '',
    pdfFile: null, coverImage: null,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState<'pdf' | 'cover' | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);

  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (json.success) setCategories(json.data);
      })
      .catch(() => setCategories([]));
      
    // Load draft if exists
    const draft = localStorage.getItem('ebook_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setForm(f => ({ ...f, ...parsed }));
      } catch (e) {
        // ignore parsing error
      }
    }
  }, []);

  const handleSaveDraft = () => {
    // Only save textual data to draft since files can't be easily stringified
    localStorage.setItem('ebook_draft', JSON.stringify({
      title: form.title,
      author: form.author,
      categoryId: form.categoryId,
      description: form.description,
      tags: form.tags
    }));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 3000);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.author || !form.pdfFile) {
      setError('Judul, Penulis, dan File PDF wajib diisi!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
  
    setLoading(true);
    setError('');

    const token = localStorage.getItem('publisher_token');
    if (!token) { router.push('/publisher/auth/login'); return; }

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('author', form.author);
    formData.append('categoryId', form.categoryId);
    formData.append('description', form.description);
    if (form.pdfFile) formData.append('pdfFile', form.pdfFile);
    if (form.coverImage) formData.append('coverImage', form.coverImage);

    try {
      const res = await fetch('/api/publisher/books', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();

      if (json.success) {
        setSuccess(true);
        localStorage.removeItem('ebook_draft'); // Clear draft
        setTimeout(() => router.push('/publisher/my-ebooks'), 2000);
      } else {
        setError(json.error || 'Upload gagal');
      }
    } catch {
      setError('Terjadi kesalahan jaringan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent, type: 'pdf' | 'cover') => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (type === 'pdf') setForm(f => ({ ...f, pdfFile: file }));
    else setForm(f => ({ ...f, coverImage: file }));
  };

  if (success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
        <div style={{ fontSize: 64 }}>✅</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Ebook Berhasil Diunggah!</h2>
        <p style={{ color: '#6B6B6B', fontSize: '0.875rem' }}>
          Buku Anda akan ditinjau oleh tim admin.
        </p>
        <p style={{ color: '#9B9B9B', fontSize: '0.813rem' }}>Mengalihkan ke My Ebooks...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
      {/* Sticky Header */}
      <header style={{ 
        position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255, 255, 255, 0.9)', 
        backdropFilter: 'blur(10px)', borderBottom: '1px solid #EAEAEA', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '16px 40px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/publisher/my-ebooks" style={{ textDecoration: 'none', color: '#666', fontSize: '20px', fontWeight: 'bold' }}>←</Link>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1A1A1A' }}>Unggah Ebook Baru</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: '#34C759', opacity: draftSaved ? 1 : 0, transition: 'opacity 0.3s' }}>
            ✓ Draft Disimpan
          </span>
          <button 
            onClick={handleSaveDraft}
            style={{ 
              background: '#F0F0F0', color: '#333', border: 'none', padding: '10px 20px', 
              borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' 
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#E5E5E5'}
            onMouseLeave={e => e.currentTarget.style.background = '#F0F0F0'}
          >
            Simpan Draft
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            style={{ 
              background: '#D4A373', color: 'white', border: 'none', padding: '10px 24px', 
              borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', 
              transition: 'background 0.2s', opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={e => !loading && (e.currentTarget.style.background = '#C29161')}
            onMouseLeave={e => !loading && (e.currentTarget.style.background = '#D4A373')}
          >
            {loading ? 'Menyimpan...' : 'Submit Ebook'}
          </button>
        </div>
      </header>

      {/* Main Split-Screen Layout */}
      <main style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* Error Banner */}
        {error && (
          <div style={{ width: '100%', background: '#FFF0F0', color: '#FF3B30', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #FFD6D6' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Kolom Kiri: Fokus Teks & Detail (65%) */}
        <div style={{ flex: '1 1 60%', background: 'white', padding: '40px', borderRadius: '16px', border: '1px solid #EAEAEA', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '32px' }}>Informasi Dasar</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Row 1: Title & Author */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>Judul Buku *</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Belajar Next.js"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #E0E0E0', fontSize: '14px', outline: 'none', background: '#FAFAFA', transition: 'border 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#D4A373'}
                  onBlur={e => e.target.style.borderColor = '#E0E0E0'}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>Penulis / Author *</label>
                <input 
                  type="text" 
                  placeholder="Nama penulis"
                  value={form.author}
                  onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                  style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #E0E0E0', fontSize: '14px', outline: 'none', background: '#FAFAFA', transition: 'border 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#D4A373'}
                  onBlur={e => e.target.style.borderColor = '#E0E0E0'}
                />
              </div>
            </div>

            {/* Row 2: Category & Tags */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>Kategori</label>
                <select 
                  value={form.categoryId}
                  onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                  style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #E0E0E0', fontSize: '14px', outline: 'none', background: '#FAFAFA', cursor: 'pointer', appearance: 'none' }}
                >
                  <option value="">Pilih Kategori...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>Tag / Kata Kunci (Opsional)</label>
                <input 
                  type="text" 
                  placeholder="Pisahkan dengan koma (contoh: bisnis, startup)"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #E0E0E0', fontSize: '14px', outline: 'none', background: '#FAFAFA', transition: 'border 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#D4A373'}
                  onBlur={e => e.target.style.borderColor = '#E0E0E0'}
                />
              </div>
            </div>

            {/* Row 3: Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#333', display: 'flex', justifyContent: 'space-between' }}>
                Deskripsi / Sinopsis
                <span style={{ color: '#999', fontWeight: 400 }}>Gunakan paragraf untuk memperjelas</span>
              </label>
              
              {/* Pseudo Rich Text Toolbar */}
              <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', background: '#F8F9FA', border: '1px solid #E0E0E0', borderBottom: 'none', borderRadius: '8px 8px 0 0' }}>
                {['B', 'I', 'U', '•'].map(btn => (
                  <div key={btn} style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px', color: '#555', cursor: 'pointer', borderRadius: '4px' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#EAEAEA'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {btn}
                  </div>
                ))}
              </div>

              <textarea 
                placeholder="Ceritakan tentang buku ini..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                style={{ 
                  padding: '16px', borderRadius: '0 0 8px 8px', border: '1px solid #E0E0E0', 
                  fontSize: '14px', outline: 'none', background: '#FFF', minHeight: '300px',
                  resize: 'vertical', lineHeight: '1.6', fontFamily: 'inherit'
                }}
                onFocus={e => e.target.style.borderColor = '#D4A373'}
                onBlur={e => e.target.style.borderColor = '#E0E0E0'}
              />
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Fokus Visual (35%) */}
        <div style={{ flex: '1 1 30%', position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Cover Image Upload */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #EAEAEA', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '16px' }}>Cover Buku</h3>
            <div 
              onDragOver={e => { e.preventDefault(); setDragOver('cover'); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => handleFileDrop(e, 'cover')}
              onClick={() => document.getElementById('cover-input')?.click()}
              style={{ 
                border: `2px dashed ${dragOver === 'cover' ? '#D4A373' : '#E0E0E0'}`, 
                borderRadius: '12px', height: '360px', display: 'flex', flexDirection: 'column', 
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: dragOver === 'cover' ? '#FAF6F2' : '#FAFAFA',
                transition: 'all 0.2s', overflow: 'hidden', position: 'relative'
              }}
              onMouseEnter={e => !form.coverImage && (e.currentTarget.style.background = '#F5F5F5')}
              onMouseLeave={e => !form.coverImage && (e.currentTarget.style.background = '#FAFAFA')}
            >
              {form.coverImage ? (
                <img 
                  src={URL.createObjectURL(form.coverImage)} 
                  alt="Cover Preview" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>🖼️</div>
                  <div style={{ fontWeight: 600, color: '#333' }}>Drag & Drop Cover Buku</div>
                  <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>Rekomendasi 800x1200px (JPG/PNG)</div>
                </div>
              )}
              <input id="cover-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && setForm(f => ({ ...f, coverImage: e.target.files![0] }))} />
            </div>
          </div>

          {/* PDF File Upload */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #EAEAEA', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '16px' }}>File Ebook *</h3>
            <div 
              onDragOver={e => { e.preventDefault(); setDragOver('pdf'); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => handleFileDrop(e, 'pdf')}
              onClick={() => document.getElementById('pdf-input')?.click()}
              style={{ 
                border: `2px dashed ${dragOver === 'pdf' ? '#D4A373' : '#E0E0E0'}`, 
                borderRadius: '12px', height: '120px', display: 'flex', flexDirection: 'column', 
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: dragOver === 'pdf' ? '#FAF6F2' : '#FAFAFA',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F5F5F5')}
              onMouseLeave={e => (e.currentTarget.style.background = '#FAFAFA')}
            >
              {form.pdfFile ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>📄</div>
                  <div style={{ fontWeight: 600, color: '#34C759', fontSize: '14px' }}>{form.pdfFile.name}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{(form.pdfFile.size / 1024 / 1024).toFixed(1)} MB</div>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 600, color: '#333' }}>Upload File PDF/EPUB</div>
                  <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>Klik atau tarik file ke sini</div>
                </div>
              )}
              <input id="pdf-input" type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && setForm(f => ({ ...f, pdfFile: e.target.files![0] }))} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
