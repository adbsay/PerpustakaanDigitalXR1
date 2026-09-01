import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  if (!id) {
    return { title: 'Edit Buku' };
  }

  try {
    const book = await prisma.book.findUnique({
      where: { id },
      select: { title: true }
    });

    if (!book) {
      return { title: 'Edit Buku' };
    }

    return { title: `Edit ${book.title}` };
  } catch {
    return { title: 'Edit Buku' };
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
