'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Edit2, Trash2, FolderOpen, Image as ImageIcon, CheckCircle2, Plus, Sparkles } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon?: string | null;
  _count?: { books: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('/api/admin/categories', { headers });
      const json = await res.json();
      if (json.success && json.data) setCategories(json.data);
    } catch (e) {
      console.error('Failed to fetch categories', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(c => c.name.toLowerCase().includes(q));
  }, [categories, searchQuery]);

  const handleEditClick = (category: Category) => {
    setEditingId(category.id);
    setNewName(category.name);
    setNewIcon(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewName('');
    setNewIcon(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    setIsSubmitting(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const formData = new FormData();
    formData.append('name', newName);
    if (newIcon) {
      formData.append('icon', newIcon);
    }
    
    if (editingId) {
      formData.append('id', editingId);
    }

    try {
      const url = '/api/admin/categories';
      const method = editingId ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method: method,
        headers,
        body: formData
      });
      const json = await res.json();
      
      if (json.success) {
        setNewName('');
        setNewIcon(null);
        setEditingId(null);
        fetchCategories();
      } else {
        alert(json.error);
      }
    } catch (error) {
      alert('Terjadi kesalahan saat memproses kategori.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus kategori "${name}"? Kategori yang dihapus tidak bisa dikembalikan.`)) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE', headers });
      if (editingId === id) handleCancelEdit();
      fetchCategories();
    } catch (e) {
      alert('Gagal menghapus kategori');
    }
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '12px 0 48px' }}>
      
      {/* PAGE HEADER */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 4px' }}>
          Kelola Kategori
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0, fontWeight: 500 }}>
          Organisasi genre, taksonomi tema, dan pengelompokan e-book platform
        </p>
      </div>

      {/* TWO COLUMNS: TABLE (LEFT) & FORM (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1.2fr] gap-6 items-start">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: CATEGORIES TABLE                            */}
        {/* ======================================================== */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          
          {/* Header Bar with Search & Total Count */}
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid #F1F5F9',
            background: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.938rem', fontWeight: 800, color: '#0F172A' }}>Daftar Kategori</span>
              <span style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                background: '#E2E8F0',
                color: '#334155',
                padding: '2px 7px',
                borderRadius: '6px'
              }}>
                {categories.length} Total
              </span>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '280px', flexShrink: 0 }}>
              <Search 
                size={15} 
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94A3B8',
                  pointerEvents: 'none',
                  zIndex: 2
                }} 
              />
              <input 
                type="text" 
                placeholder="Cari kategori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 14px 9px 40px',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  fontSize: '0.813rem',
                  color: '#0F172A',
                  outline: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* DESKTOP TABLE (hidden on mobile) */}
          <div className="hidden lg:block" style={{ overflowX: 'auto', minHeight: '340px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
                  <th style={{ padding: '14px 20px', fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '55%' }}>
                    Nama Kategori
                  </th>
                  <th style={{ padding: '14px 20px', fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '25%' }}>
                    Total Ebooks
                  </th>
                  <th style={{ padding: '14px 20px', fontSize: '0.688rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '20%', textAlign: 'right' }}>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '64px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        border: '2px solid #0F172A',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        margin: '0 auto'
                      }} />
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '64px 20px', color: '#94A3B8' }}>
                      <FolderOpen size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>
                        {searchQuery ? 'Tidak ada kategori yang cocok dengan pencarian.' : 'Belum ada kategori yang ditambahkan.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat, index) => (
                    <tr 
                      key={cat.id} 
                      style={{
                        borderBottom: index === filteredCategories.length - 1 ? 'none' : '1px solid #F8FAFC',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            color: '#475569'
                          }}>
                            {cat.icon ? (
                              <img src={cat.icon} alt={cat.name} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                            ) : (
                              <FolderOpen size={18} />
                            )}
                          </div>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
                            {cat.name}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 10px',
                          background: '#F1F5F9',
                          color: '#0F172A',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          borderRadius: '6px'
                        }}>
                          {cat._count?.books || 0} Ebook
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button 
                            onClick={() => handleEditClick(cat)}
                            title="Edit Kategori"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: '#FFFFFF',
                              border: '1px solid #E2E8F0',
                              color: '#334155',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Edit2 size={13} />
                          </button>
                          
                          <button 
                            onClick={() => handleDelete(cat.id, cat.name)}
                            title="Hapus Kategori"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: '#FFFFFF',
                              border: '1px solid #E2E8F0',
                              color: '#DC2626',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARD LIST VIEW (block on < 1024px) */}
          <div className="block lg:hidden" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  border: '2px solid #0F172A',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto'
                }} />
              </div>
            ) : filteredCategories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94A3B8' }}>
                <FolderOpen size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                <p style={{ fontSize: '0.813rem', fontWeight: 600, margin: 0 }}>
                  {searchQuery ? 'Tidak ada kategori yang cocok.' : 'Belum ada kategori.'}
                </p>
              </div>
            ) : (
              filteredCategories.map((cat) => (
                <div 
                  key={cat.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    border: '1px solid #E2E8F0',
                    padding: '14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  {/* Left: Icon + Name & Count */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: '#475569'
                    }}>
                      {cat.icon ? (
                        <img src={cat.icon} alt={cat.name} style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                      ) : (
                        <FolderOpen size={16} />
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {cat.name}
                      </div>
                      <div style={{ fontSize: '0.719rem', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>
                        {cat._count?.books || 0} Ebook
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button 
                      onClick={() => handleEditClick(cat)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '7px',
                        background: '#F1F5F9',
                        border: '1px solid #E2E8F0',
                        color: '#334155',
                        fontSize: '0.719rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Edit2 size={12} />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(cat.id, cat.name)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '7px',
                        background: '#FEF2F2',
                        border: '1px solid #FECACA',
                        color: '#DC2626',
                        fontSize: '0.719rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Trash2 size={12} />
                      Hapus
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: TAMBAH / EDIT FORM CARD                    */}
        {/* ======================================================== */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.02)',
          padding: '24px',
          position: 'sticky',
          top: '24px'
        }}>
          {/* Form Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: editingId ? '#EEF2FF' : '#0F172A',
              color: editingId ? '#4F46E5' : '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {editingId ? <Edit2 size={18} /> : <Plus size={18} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.063rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {editingId ? 'Edit Kategori' : 'Tambah Kategori'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
                {editingId ? 'Perbarui informasi nama atau ikon genre' : 'Tambahkan kategori e-book baru ke sistem'}
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Input Nama */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.813rem', fontWeight: 700, color: '#334155' }}>
                Nama Kategori <span style={{ color: '#E11D48' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Misal: Fiksi Ilmiah, Psikologi..."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  color: '#0F172A',
                  outline: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}
              />
            </div>
            
            {/* Input SVG Icon */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.813rem', fontWeight: 700, color: '#334155' }}>
                Ikon Kategori (SVG)
              </label>
              
              <div 
                style={{
                  position: 'relative',
                  border: newIcon ? '1.5px solid #0F172A' : '1.5px dashed #CBD5E1',
                  background: newIcon ? '#F8FAFC' : '#FFFFFF',
                  borderRadius: '12px',
                  padding: '24px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <input
                  type="file"
                  accept=".svg,image/svg+xml"
                  onChange={e => setNewIcon(e.target.files?.[0] || null)}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                    zIndex: 10
                  }}
                />
                
                {newIcon ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: '#ECFDF5',
                      color: '#059669',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <CheckCircle2 size={22} />
                    </div>
                    <span style={{ fontSize: '0.813rem', fontWeight: 700, color: '#0F172A', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {newIcon.name}
                    </span>
                    <span style={{ fontSize: '0.688rem', color: '#64748B' }}>Klik untuk mengganti berkas SVG</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: '#F1F5F9',
                      color: '#64748B',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ImageIcon size={20} />
                    </div>
                    <span style={{ fontSize: '0.813rem', fontWeight: 700, color: '#0F172A' }}>Pilih file SVG</span>
                    <span style={{ fontSize: '0.688rem', color: '#94A3B8' }}>Format vektor transparan direkomendasikan</span>
                  </div>
                )}
              </div>
            </div>

            {/* Form Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                {isSubmitting ? (
                  <div style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#FFFFFF',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                ) : (
                  editingId ? 'Simpan Perubahan Kategori' : 'Tambah Kategori Sekarang'
                )}
              </button>
              
              {editingId && (
                <button 
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#FFFFFF',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '0.813rem',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    cursor: 'pointer'
                  }}
                >
                  Batal Edit
                </button>
              )}
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
