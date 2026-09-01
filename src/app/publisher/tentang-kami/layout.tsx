import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tentang Kami - Publisher',
  icons: {
    icon: '/publisher-icon.svg',
    shortcut: '/publisher-icon.svg',
    apple: '/publisher-icon.svg',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
