'use client';

import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  icon?: string | null;
  _count?: { books: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    const token = localStorage.getItem('admin_token');
    const res = await fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json();
    if (json.success) setCategories(json.data);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    setIsSubmitting(true);
    const token = localStorage.getItem('admin_token');
    
    const formData = new FormData();
    formData.append('name', newName);
    if (newIcon) {
      formData.append('icon', newIcon);
    }

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }, // Note: Don't set Content-Type for FormData
        body: formData
      });
      const json = await res.json();
      if (json.success) {
        setNewName('');
        setNewIcon(null);
        fetchCategories();
      } else {
        alert(json.error);
      }
    } catch (error) {
      alert('Terjadi kesalahan saat menambahkan kategori.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    const token = localStorage.getItem('admin_token');
    await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchCategories();
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Manage Categories</h1>
        <p className="page-subtitle">Organize book genres and categories</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Total Books</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} style={{ textAlign: 'center' }}>Loading...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: 'center' }}>No categories found</td></tr>
              ) : categories.map(cat => (
                <tr key={cat.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '10px', 
                        background: 'linear-gradient(135deg, rgba(201, 169, 110, 0.1), rgba(201, 169, 110, 0.2))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid rgba(201, 169, 110, 0.3)'
                      }}>
                        {cat.icon ? (
                          <img src={cat.icon} alt={cat.name} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: '14px', color: '#C9A96E' }}>📁</span>
                        )}
                      </div>
                      <span style={{ fontWeight: 500, color: '#1A1A1A' }}>{cat.name}</span>
                    </div>
                  </td>
                  <td>{cat._count?.books || 0}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat.id, cat.name)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Add New Category</h3>
          <form onSubmit={handleAdd}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Category Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Science Fiction"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Category Icon (SVG)</label>
              <div style={{
                border: '2px dashed #E2E8F0',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                backgroundColor: newIcon ? '#F8FAFC' : '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#C9A96E'}
              onMouseLeave={e => e.currentTarget.style.borderColor = newIcon ? '#C9A96E' : '#E2E8F0'}
              >
                <input
                  type="file"
                  accept=".svg,image/svg+xml"
                  onChange={e => setNewIcon(e.target.files?.[0] || null)}
                  style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%',
                    opacity: 0, cursor: 'pointer', zIndex: 10
                  }}
                />
                {newIcon ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '48px', height: '48px', background: 'rgba(201, 169, 110, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '24px', color: '#C9A96E' }}>✓</span>
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1A1A1A' }}>{newIcon.name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Klik untuk mengganti SVG</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '48px', height: '48px', background: '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1A1A1A' }}>Pilih file SVG</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Background transparan direkomendasikan</span>
                  </div>
                )}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', opacity: isSubmitting ? 0.7 : 1 }} disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Category'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
