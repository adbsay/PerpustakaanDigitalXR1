import type { Metadata } from 'next';
import PublisherLayoutClient from './PublisherLayoutClient';

export const metadata: Metadata = {
  title: 'Portal Publisher',
  icons: {
    icon: '/publisher-icon.svg',
    shortcut: '/publisher-icon.svg',
    apple: '/publisher-icon.svg',
  },
};

export default function PublisherLayout({ children }: { children: React.ReactNode }) {
  return <PublisherLayoutClient>{children}</PublisherLayoutClient>;
}
