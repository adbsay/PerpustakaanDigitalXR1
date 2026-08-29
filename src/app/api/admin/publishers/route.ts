import { NextRequest } from 'next/server';
import {
  createPublisherRepository,
  verifyAdminAuth,
  successResponse,
  errorResponse,
} from '@/lib/auth';

// GET /api/admin/publishers
export async function GET(req: NextRequest) {
  const admin = await verifyAdminAuth(req);
  if (!admin) return errorResponse('Unauthorized', 401);

  try {
    const repo = createPublisherRepository();
    const publishers = await repo.findAll();
    return successResponse(publishers.map(p => p.toJSON()));
  } catch {
    return errorResponse('Failed to fetch publishers');
  }
}
