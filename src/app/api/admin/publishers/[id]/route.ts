import { NextRequest } from 'next/server';
import {
  createPublisherRepository,
  verifyAdminAuth,
  successResponse,
  errorResponse,
} from '@/lib/auth';
import { PublisherStatus } from '@prisma/client';

type Params = { params: Promise<{ id: string }> };

// PATCH /api/admin/publishers/[id] — ban/unban publisher
export async function PATCH(req: NextRequest, { params }: Params) {
  const admin = await verifyAdminAuth(req);
  if (!admin) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const body = await req.json();
  const { action } = body; // 'ban' | 'unban'

  if (!['ban', 'unban'].includes(action)) {
    return errorResponse('Invalid action');
  }

  try {
    const repo = createPublisherRepository();
    const publisher = await repo.update(id, {
      status: (action === 'ban' ? 'BANNED' : 'ACTIVE') as PublisherStatus,
    });
    return successResponse(publisher.toJSON());
  } catch {
    return errorResponse('Failed to update publisher');
  }
}

// GET /api/admin/publishers/[id]
export async function GET(req: NextRequest, { params }: Params) {
  const admin = await verifyAdminAuth(req);
  if (!admin) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const repo = createPublisherRepository();
  const publisher = await repo.findById(id);

  if (!publisher) return errorResponse('Publisher not found', 404);
  return successResponse(publisher.toJSON());
}
