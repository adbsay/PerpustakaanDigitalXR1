



import { NextRequest } from 'next/server';
import { verifyPublisherAuth, successResponse, errorResponse } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const publisher = await verifyPublisherAuth(req);
  if (!publisher) return errorResponse('Unauthorized', 401);

  try {
    const notifications = await prisma.book.findMany({
      where: {
        publisherId: publisher.id,
        status: { in: ['PUBLISHED', 'BANNED'] },
        updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      },
      select: { title: true, status: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 10
    });

    return successResponse(notifications);
  } catch (error) {
    return errorResponse('Failed to fetch notifications');
  }
}
