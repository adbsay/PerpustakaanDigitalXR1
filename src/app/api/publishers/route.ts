// Public publishers API for visitor portal
import { NextRequest } from 'next/server';
import { createPublisherRepository, successResponse, errorResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const repo = createPublisherRepository();
    const publishers = await repo.findActive();
    return successResponse(publishers.map(p => ({ id: p.id, name: p.name, totalBooks: p.totalBooks })));
  } catch {
    return errorResponse('Failed to fetch publishers');
  }
}
