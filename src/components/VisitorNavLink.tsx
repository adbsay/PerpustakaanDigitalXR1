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
      color: isActive ? '#000000' : '#4B5563', 
      textDecoration: 'none',
      display: 'inline-block',
      padding: '4px 0px',
      transition: 'color 0.2s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.color = '#000000';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.color = isActive ? '#000000' : '#4B5563';
    }}
    >
      {children}
      <span style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
        width: '100%',
        height: '2px',
        backgroundColor: '#C9A96E',
        transition: 'transform 0.3s ease',
        transformOrigin: 'left'
      }} />
    </Link>
  );
}
