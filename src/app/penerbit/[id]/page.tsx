import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PublisherClientView from './PublisherClientView';

export default async function PublisherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const publisher = await prisma.publisher.findFirst({
    where: { id: id, status: 'ACTIVE' },
    include: {
      books: {
        where: { status: 'PUBLISHED' },
        include: { 
          ratings: true, 
          _count: { select: { views: true } } 
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!publisher) {
    return notFound();
  }

  // Serialize Date object to ISO string
  const serializedPublisher = {
    ...publisher,
    createdAt: publisher.createdAt.toISOString(),
    updatedAt: publisher.updatedAt.toISOString(),
    books: publisher.books.map(b => ({
      id: b.id,
      title: b.title,
      author: b.author,
      coverImage: b.coverImage,
      ratings: b.ratings.map(r => ({ score: r.score })),
      _count: { views: b._count?.views || 0 }
    }))
  };

  return <PublisherClientView publisher={serializedPublisher} />;
}
