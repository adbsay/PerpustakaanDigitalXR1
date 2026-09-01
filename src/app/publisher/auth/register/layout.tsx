import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pendaftaran Publisher',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
