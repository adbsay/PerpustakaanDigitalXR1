import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upload Buku Baru',
  icons: {
    icon: '/publisher-icon.svg',
    shortcut: '/publisher-icon.svg',
    apple: '/publisher-icon.svg',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
