import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pertanyaan Umum (FAQ)',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
