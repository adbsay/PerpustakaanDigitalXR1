'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface VisitorNavLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function VisitorNavLink({ href, children }: VisitorNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} style={{ 
      position: 'relative',
      color: '#1a1a1a', 
      textDecoration: 'none',
      display: 'inline-block',
      padding: '4px 8px',
      transition: 'transform 0.2s ease, text-shadow 0.2s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'scale(1.05)';
      e.currentTarget.style.textShadow = '0 2px 4px rgba(0,0,0,0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.textShadow = 'none';
    }}
    >
      {children}
      <span style={{
        position: 'absolute',
        bottom: 0,
        left: '10%',
        transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
        width: '80%',
        height: '2px',
        backgroundColor: '#C9A96E',
        transition: 'transform 0.3s ease',
        transformOrigin: 'left'
      }} />
    </Link>
  );
}
