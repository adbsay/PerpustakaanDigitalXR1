'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, BookOpen, Tags, Flag, Megaphone, FileText, LogOut, ShieldCheck, PanelLeftClose, PanelLeft, ChevronRight
} from 'lucide-react';

interface Admin {
  id: string;
  name: string;
  email: string;
}

const navGroups = [
  {
    title: 'Analytics',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
      { label: 'Reports', icon: Flag, href: '/admin/reports' },
    ]
  },
  {
    title: 'Management',
    items: [
      { label: 'Manage Publishers', icon: Users, href: '/admin/publishers' },
      { label: 'Manage Ebooks', icon: BookOpen, href: '/admin/books' },
      { label: 'Categories', icon: Tags, href: '/admin/categories' },
    ]
  },
  {
    title: 'System',
    items: [
      { label: 'Announcements', icon: Megaphone, href: '/admin/announcements' },
      { label: 'Audit Log', icon: FileText, href: '/admin/audit' },
    ]
  }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<Admin | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
  }, [pathname, isAuthPage, router]);

  const handleLogout = async () => {
    await fetch('/api/admin/auth/me', { method: 'POST' });
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/auth/login');
  };

  if (isAuthPage) return <>{children}</>;

  const sidebarWidth = isCollapsed ? 72 : 240;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
      
      {/* SIDEBAR */}
      <aside 
        style={{
          width: `${sidebarWidth}px`,
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 90,
          background: '#FFFFFF',
          borderRight: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '2px 0 10px rgba(0, 0, 0, 0.02)'
        }}
      >
        
        {/* HEADER IDENTITY */}
        <div style={{
          height: '70px',
          padding: isCollapsed ? '0 16px' : '0 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid #F1F5F9',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          flexShrink: 0
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: '#0F172A',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.2)'
          }}>
            <ShieldCheck size={20} strokeWidth={2.2} />
          </div>

          {!isCollapsed && (
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user ? user.name : 'Admin Panel'}
              </div>
              <div style={{ marginTop: '2px' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  background: '#F1F5F9',
                  color: '#475569',
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  borderRadius: '4px'
                }}>
                  Super Admin
                </span>
              </div>
            </div>
          )}
        </div>

        {/* TOGGLE BUTTON */}
        <div style={{ position: 'absolute', top: '22px', right: '-13px', zIndex: 100 }}>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              width: '26px',
              height: '26px',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
              transition: 'all 0.15s ease'
            }}
            title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          >
            {isCollapsed ? <PanelLeft size={13} /> : <PanelLeftClose size={13} />}
          </button>
        </div>

        {/* NAVIGATION GROUPS */}
        <nav style={{
          flex: 1,
          overflowY: 'auto',
          padding: isCollapsed ? '16px 10px' : '18px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {navGroups.map((group, i) => (
            <div key={i}>
              {!isCollapsed ? (
                <div style={{
                  fontSize: '0.688rem',
                  fontWeight: 800,
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '0 10px',
                  marginBottom: '8px'
                }}>
                  {group.title}
                </div>
              ) : (
                <div style={{ width: '24px', height: '1px', background: '#E2E8F0', margin: '0 auto 8px' }} />
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {group.items.map(item => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: isCollapsed ? '10px' : '9px 12px',
                        borderRadius: '10px',
                        fontSize: '0.813rem',
                        fontWeight: isActive ? 700 : 500,
                        textDecoration: 'none',
                        background: isActive ? '#0F172A' : 'transparent',
                        color: isActive ? '#FFFFFF' : '#475569',
                        boxShadow: isActive ? '0 2px 6px rgba(15, 23, 42, 0.15)' : 'none',
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Icon 
                        size={17} 
                        color={isActive ? '#FFFFFF' : '#64748B'} 
                        strokeWidth={isActive ? 2.3 : 1.8} 
                        style={{ flexShrink: 0 }}
                      />
                      {!isCollapsed && (
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.label}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* FOOTER USER / LOGOUT */}
        <div style={{
          padding: isCollapsed ? '14px 10px' : '14px 12px',
          borderTop: '1px solid #F1F5F9',
          background: '#FFFFFF',
          flexShrink: 0
        }}>
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : undefined}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: isCollapsed ? '10px' : '9px 12px',
              borderRadius: '10px',
              fontSize: '0.813rem',
              fontWeight: 600,
              color: '#DC2626',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              cursor: 'pointer',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              transition: 'all 0.15s ease'
            }}
          >
            <LogOut size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
            {!isCollapsed && <span>Keluar Sistem</span>}
          </button>
        </div>

      </aside>

      {/* MAIN CONTENT AREA */}
      <main 
        style={{
          flex: 1,
          marginLeft: `${sidebarWidth}px`,
          padding: '32px',
          transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          minWidth: 0
        }}
      >
        {children}
      </main>

    </div>
  );
}
