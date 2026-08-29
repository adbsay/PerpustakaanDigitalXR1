import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth, successResponse, errorResponse } from '@/lib/auth';

// GET /api/admin/audit
export async function GET(req: NextRequest) {
  const admin = await verifyAdminAuth(req);
  if (!admin) return errorResponse('Unauthorized', 401);

  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        admin: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to recent 100 for performance
    });

    return successResponse(logs);
  } catch (error) {
    return errorResponse('Failed to fetch audit logs');
  }
}
