import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  
  if (!resolvedParams.id) {
    return { title: 'Buku tidak ditemukan' };
  }

  try {
    const book = await prisma.book.findUnique({
      where: { id: resolvedParams.id },
      select: { title: true }
    });

    if (!book) {
      return { title: 'Buku tidak ditemukan' };
    }

    return { title: book.title };
  } catch {
    return { title: 'Buku tidak ditemukan' };
  }
}

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
