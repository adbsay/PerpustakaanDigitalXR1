import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPublisherAuth, successResponse, errorResponse } from '@/lib/auth';

// GET /api/publisher/announcements
export async function GET(req: NextRequest) {
  const publisher = await verifyPublisherAuth(req);
  if (!publisher) return errorResponse('Unauthorized', 401);

  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [
          { target: 'ALL' },
          { target: 'PUBLISHERS' },
          { target: 'PUBLISHER' }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    return successResponse(announcements);
  } catch (error) {
    return errorResponse('Failed to fetch announcements');
  }
}
