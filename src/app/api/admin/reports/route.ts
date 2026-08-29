import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth, successResponse, errorResponse } from '@/lib/auth';
import { ReportStatus } from '@prisma/client';

// GET /api/admin/reports
export async function GET(req: NextRequest) {
  const admin = await verifyAdminAuth(req);
  if (!admin) return errorResponse('Unauthorized', 401);

  try {
    const reports = await prisma.report.findMany({
      include: {
        book: {
          select: { id: true, title: true, publisher: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(reports);
  } catch (error) {
    return errorResponse('Failed to fetch reports');
  }
}

// PUT /api/admin/reports
export async function PUT(req: NextRequest) {
  const admin = await verifyAdminAuth(req);
  if (!admin) return errorResponse('Unauthorized', 401);

  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) return errorResponse('ID and status are required');
    if (!['OPEN', 'RESOLVED', 'REJECTED'].includes(status)) return errorResponse('Invalid status');

    const report = await prisma.report.update({
      where: { id },
      data: { status: status as ReportStatus }
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: 'UPDATE_REPORT',
        details: `Updated report ${id} status to ${status}`
      }
    });

    return successResponse(report);
  } catch (error) {
    return errorResponse('Failed to update report');
  }
}
