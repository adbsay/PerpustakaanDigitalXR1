'use client';

import dynamic from 'next/dynamic';

const GlobalVisitorNavbar = dynamic(() => import('./GlobalVisitorNavbar'), {
  ssr: false,
  loading: () => (
    <div 
      style={{ 
        height: '58px', 
        width: '100%', 
        background: '#FFFFFF', 
        borderBottom: '1px solid #EAEAEA',
        position: 'sticky',
        top: 0,
        zIndex: 9990
      }} 
    />
  )
});

export default function GlobalVisitorNavbarWrapper() {
  return <GlobalVisitorNavbar />;
}
