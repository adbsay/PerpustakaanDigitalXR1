import { NextRequest } from 'next/server';
import {
  createBookRepository,
  createPublisherRepository,
  verifyAdminAuth,
  successResponse,
  errorResponse,
} from '@/lib/auth';
import { AnalyticsService } from '@/classes/services/AnalyticsService';

// GET /api/admin/stats
export async function GET(req: NextRequest) {
  const admin = await verifyAdminAuth(req);
  if (!admin) return errorResponse('Unauthorized', 401);

  try {
    const analyticsService = new AnalyticsService(
      createBookRepository(),
      createPublisherRepository(),
    );
    const stats = await analyticsService.getAdminStats();
    const topPublishers = await analyticsService.getTopPublishers();
    return successResponse({ stats, topPublishers });
  } catch {
    return errorResponse('Failed to fetch stats');
  }
}
