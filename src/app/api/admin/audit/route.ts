import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth, successResponse, errorResponse } from '@/lib/auth';

// GET /api/admin/audit
export async function GET(req: NextRequest) {
  const admin = await verifyAdminAuth(req);
  if (!admin) return errorResponse('Unauthorized', 401);

  try {
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const action = url.searchParams.get('action') || '';
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    const where: any = {};

    if (search) {
      where.admin = {
        email: { contains: search, mode: 'insensitive' }
      };
    }

    if (action && action !== 'ALL') {
      where.action = { contains: action, mode: 'insensitive' };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(`${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        where.createdAt.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        admin: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Tetap dibatasi 100 untuk performa visualisasi awal
    });

    return successResponse(logs);
  } catch (error) {
    console.error(error);
    return errorResponse('Failed to fetch audit logs');
  }
}
