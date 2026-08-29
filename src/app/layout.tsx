import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Digital Library — Free Ebooks for Everyone',
  description:
    'Perpustakaan digital gratis. Temukan, baca, dan unduh ribuan ebook pilihan tanpa perlu mendaftar. Akses langsung dari browser.',
  keywords: ['ebook', 'perpustakaan digital', 'buku gratis', 'baca online'],
  openGraph: {
    title: 'Digital Library — Free Ebooks for Everyone',
    description: 'Temukan dan baca ebook gratis tanpa registrasi.',
    type: 'website',
  },
};

import GlobalVisitorNavbar from '@/components/GlobalVisitorNavbar';
import { SearchProvider } from '@/context/SearchContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SearchProvider>
          <GlobalVisitorNavbar />
          {children}
        </SearchProvider>
      </body>
    </html>
  );
}
