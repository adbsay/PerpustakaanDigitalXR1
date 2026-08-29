'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface Admin {
  id: string;
  name: string;
  email: string;
}

const navItems = [
  { label: 'Dashboard', icon: '📊', href: '/admin/dashboard' },
  { label: 'Manage Publishers', icon: '👥', href: '/admin/publishers' },
  { label: 'Manage Ebooks', icon: '📚', href: '/admin/books' },
  { label: 'Categories', icon: '🏷️', href: '/admin/categories' },
  { label: 'Reports', icon: '🚩', href: '/admin/reports' },
  { label: 'Announcements', icon: '📢', href: '/admin/announcements' },
  { label: 'Audit Log', icon: '📝', href: '/admin/audit' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<Admin | null>(null);

  const isAuthPage = pathname?.includes('/admin/auth');

  useEffect(() => {
    if (!isAuthPage) {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/auth/login');
        return;
      }

      fetch('/api/admin/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(j => {
          if (j.success) {
            setUser(j.data);
            localStorage.setItem('admin_user', JSON.stringify(j.data));
          } else {
            router.push('/admin/auth/login');
          }
        })
        .catch(() => router.push('/admin/auth/login'));
    }
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/admin/auth/me', { method: 'POST' });
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/auth/login');
  };

  if (isAuthPage) return <>{children}</>;

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="sidebar" style={{ borderRight: '1px solid #EBEBEB' }}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" style={{ background: '#1A1A1A', color: 'white' }}>🛡️</div>
          <div>
            <div className="sidebar-logo-text">Admin Panel</div>
            <div className="sidebar-logo-sub">System Access</div>
          </div>
        </div>

        {user && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar" style={{ background: '#1A1A1A', color: 'white' }}>A</div>
            <div>
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-role">Super Admin</div>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item ${pathname === item.href ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="sidebar-nav-item"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#FF3B30' }}
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
