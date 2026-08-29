'use client';

import { useState, useEffect, useRef } from 'react';

interface PublisherProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
}

export default function PublisherProfilePage() {
  const [profile, setProfile] = useState<PublisherProfile | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('publisher_token');
      if (!token) return;
      try {
        const res = await fetch('/api/publisher/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const j = await res.json();
        if (j.success) {
          setProfile(j.data);
          setName(j.data.name);
          setPhone(j.data.phone || '');
          setAvatarPreview(j.data.avatar);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });
    const token = localStorage.getItem('publisher_token');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone);
      if (avatarFile) formData.append('avatar', avatarFile);

      const res = await fetch('/api/publisher/profile', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const j = await res.json();
      if (j.success) {
        setMessage({ text: 'Profil berhasil diperbarui!', type: 'success' });
        localStorage.setItem('publisher_user', JSON.stringify(j.data));
        // Force layout re-render for sidebar update
        window.dispatchEvent(new Event('storage'));
      } else {
        setMessage({ text: j.error || 'Gagal menyimpan profil', type: 'error' });
      }
    } catch (e) {
      setMessage({ text: 'Terjadi kesalahan jaringan', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Profile Settings</h1>
        <p className="page-subtitle">Kelola informasi akun penerbit kamu</p>
      </div>

      <div style={{ background: 'white', padding: 32, borderRadius: 16, border: '1px solid #EBEBEB', maxWidth: 600 }}>
        
        {/* Avatar Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
          <div 
            style={{ 
              width: 100, height: 100, borderRadius: '50%', background: '#F5F5F3', 
              overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #EBEBEB', position: 'relative'
            }}
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 40 }}>👤</span>
            )}
          </div>
          <div>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }} 
            />
            <button className="btn btn-ghost" onClick={() => fileInputRef.current?.click()} style={{ marginBottom: 8 }}>
              Pilih Foto Baru
            </button>
            <div style={{ fontSize: '0.75rem', color: '#9B9B9B' }}>JPG, PNG max 5MB. Rasio 1:1 disarankan.</div>
          </div>
        </div>

        {/* Form Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Email (Tidak dapat diubah)</label>
            <input type="email" className="form-input" value={profile?.email} disabled style={{ background: '#F9F9F9', color: '#9B9B9B' }} />
          </div>
          
          <div className="form-group">
            <label className="form-label">Nama / Nama Penerbit</label>
            <input 
              type="text" 
              className="form-input" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Masukkan nama penerbit" 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nomor WhatsApp / Telepon</label>
            <input 
              type="text" 
              className="form-input" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              placeholder="0812xxxxxx" 
            />
          </div>

          {message.text && (
            <div style={{
              background: message.type === 'success' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)',
              color: message.type === 'success' ? '#34C759' : '#FF3B30',
              padding: '12px 16px', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500
            }}>
              {message.type === 'success' ? '✅' : '⚠️'} {message.text}
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving || !name}>
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
        
      </div>
    </>
  );
}
