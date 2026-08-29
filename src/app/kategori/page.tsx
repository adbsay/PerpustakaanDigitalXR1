'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import VisitorNavLink from '@/components/VisitorNavLink';

interface Category {
  id: string;
  name: string;
  icon: string | null;
  _count?: {
    books: number;
  };
}

export default function KategoriPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const json = await res.json();
      if (json.success) setCategories(json.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchRedirect = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get('q');
    if (q) {
      router.push(`/?q=${encodeURIComponent(q as string)}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
      {/* ---- MAIN CONTENT ---- */}
      <main style={{ padding: '60px 40px', maxWidth: '1280px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A1A', marginBottom: '32px' }}>
          Jelajahi Kategori
        </h2>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '240px', borderRadius: '8px' }} />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
            Belum ada kategori tersedia
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: '24px' 
          }}>
            {categories.map((cat) => (
              <Link 
                href={`/?q=${encodeURIComponent(cat.name)}`} 
                key={cat.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '40px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                  border: '1px solid #F0F0F0',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = '#C9A96E';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.03)';
                  e.currentTarget.style.borderColor = '#F0F0F0';
                }}
              >
                <div style={{
                  width: '80px', height: '80px', marginBottom: '24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {cat.icon ? (
                    <img 
                      src={cat.icon} 
                      alt={cat.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                    />
                  ) : (
                    <span style={{ fontSize: '48px' }}>📁</span>
                  )}
                </div>
                
                <h3 style={{ 
                  fontSize: '15px', 
                  fontWeight: 700, 
                  color: '#1A1A1A', 
                  margin: '0 0 8px 0',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  letterSpacing: '0.5px'
                }}>
                  {cat.name}
                </h3>
                
                <p style={{ 
                  margin: 0, 
                  fontSize: '13px', 
                  color: '#6B6B6B' 
                }}>
                  ({cat._count?.books || 0} Buku)
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
