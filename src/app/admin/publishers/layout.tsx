import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kelola Publisher',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
