import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jelajah Kategori',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
