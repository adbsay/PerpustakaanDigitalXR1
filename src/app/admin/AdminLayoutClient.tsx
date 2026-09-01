'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, BookOpen, Tags, Flag, Megaphone, FileText, LogOut, 
  ShieldCheck, PanelLeftClose, PanelLeft, Menu, X
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

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<Admin | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthPage = pathname?.includes('/admin/auth');

  useEffect(() => {
    if (!isAuthPage) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      fetch('/api/admin/auth/me', { headers })
        .then(r => r.json())
        .then(j => {
          if (j.success && j.data) {
            setUser(j.data);
            if (typeof window !== 'undefined') {
              localStorage.setItem('admin_user', JSON.stringify(j.data));
            }
          } else {
            router.push('/admin/auth/login');
          }
        })
        .catch(() => {
          // If network error, try using cached user
          const cached = typeof window !== 'undefined' ? localStorage.getItem('admin_user') : null;
          if (cached) {
            try { setUser(JSON.parse(cached)); } catch {}
          }
        });
    }
  }, [pathname, isAuthPage, router]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/admin/auth/me', { method: 'POST' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
    router.push('/admin/auth/login');
  };

  if (isAuthPage) return <>{children}</>;

  const sidebarWidth = isCollapsed ? 72 : 240;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F8FAFC', ...( { '--sidebar-width': `${sidebarWidth}px` } as any ) }}>
      
      {/* MOBILE TOP APP BAR (< 1024px) */}
      <header className="lg:hidden" style={{
        height: '60px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px 0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '9px',
            background: '#0F172A',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.2)'
          }}>
            <ShieldCheck size={19} strokeWidth={2.2} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.938rem', fontWeight: 800, color: '#0F172A' }}>
              Admin Panel
            </span>
            <span style={{
              fontSize: '0.625rem',
              fontWeight: 800,
              color: '#DC2626',
              background: '#FEF2F2',
              padding: '1px 6px',
              borderRadius: '4px',
              border: '1px solid #FECACA'
            }}>
              SUPER
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Buka menu navigasi"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#0F172A',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
          }}
        >
          <Menu size={24} strokeWidth={2.2} />
        </button>
      </header>

      {/* MOBILE BACKDROP OVERLAY */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="lg:hidden"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            zIndex: 998,
            transition: 'opacity 0.25s ease',
          }}
        />
      )}

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        
        {/* SIDEBAR / MOBILE OFF-CANVAS DRAWER */}
        <aside 
          className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}
          style={{
            background: '#FFFFFF',
            borderRight: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
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
            justifyContent: isCollapsed ? 'center' : 'space-between',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
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
                <div style={{ overflow: 'hidden', minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {user ? user.name : 'Super Admin'}
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

            {/* Mobile close button (X) inside drawer */}
            <button
              type="button"
              className="lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Tutup menu navigasi"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#F1F5F9',
                border: 'none',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <X size={18} strokeWidth={2.2} />
            </button>
          </div>

          {/* DESKTOP COLLAPSE TOGGLE BUTTON (Hidden on mobile) */}
          <div className="hidden lg:block" style={{ position: 'absolute', top: '22px', right: '-13px', zIndex: 100 }}>
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
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

          {/* NAVIGATION GROUPS (All 7 items in 3 sections) */}
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
                        onClick={() => setMobileOpen(false)}
                        title={isCollapsed ? item.label : undefined}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: isCollapsed ? '10px' : '10px 12px',
                          borderRadius: '10px',
                          fontSize: '0.813rem',
                          fontWeight: isActive ? 700 : 500,
                          textDecoration: 'none',
                          background: isActive ? '#0F172A' : 'transparent',
                          color: isActive ? '#FFFFFF' : '#475569',
                          boxShadow: isActive ? '0 2px 6px rgba(15, 23, 42, 0.15)' : 'none',
                          justifyContent: isCollapsed ? 'center' : 'flex-start',
                          transition: 'all 0.15s ease',
                          minHeight: '40px'
                        }}
                      >
                        <Icon 
                          size={18} 
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
                padding: isCollapsed ? '10px' : '10px 12px',
                borderRadius: '10px',
                fontSize: '0.813rem',
                fontWeight: 600,
                color: '#DC2626',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                cursor: 'pointer',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                transition: 'all 0.15s ease',
                minHeight: '42px'
              }}
            >
              <LogOut size={17} strokeWidth={2} style={{ flexShrink: 0 }} />
              {!isCollapsed && <span>Keluar Sistem</span>}
            </button>
          </div>

        </aside>

        {/* MAIN CONTENT AREA */}
        <main 
          className="admin-main"
          style={{
            flex: 1,
            transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            minWidth: 0,
            width: '100%',
          }}
        >
          {children}
        </main>
      </div>

    </div>
  );
}
