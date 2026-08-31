import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth, successResponse, errorResponse } from '@/lib/auth';

// GET /api/admin/announcements
export async function GET(req: NextRequest) {
  const admin = await verifyAdminAuth(req);
  if (!admin) return errorResponse('Unauthorized', 401);

  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return successResponse(announcements);
  } catch (error) {
    return errorResponse('Failed to fetch announcements');
  }
}

// POST /api/admin/announcements
export async function POST(req: NextRequest) {
  const admin = await verifyAdminAuth(req);
  if (!admin) return errorResponse('Unauthorized', 401);

  try {
    const body = await req.json();
    const { title, content, target = 'ALL' } = body;
    if (!title || !content) return errorResponse('Title and content are required');

    const announcement = await prisma.announcement.create({
      data: { title, content, target }
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: 'CREATE_ANNOUNCEMENT',
        details: `Created announcement: ${title} to ${target}`
      }
    });

    return successResponse(announcement, 201);
  } catch (error) {
    return errorResponse('Failed to create announcement');
  }
}

// DELETE /api/admin/announcements
export async function DELETE(req: NextRequest) {
  const admin = await verifyAdminAuth(req);
  if (!admin) return errorResponse('Unauthorized', 401);

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return errorResponse('ID is required');

    await prisma.announcement.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: 'DELETE_ANNOUNCEMENT',
        details: `Deleted announcement ${id}`
      }
    });

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse('Failed to delete announcement');
  }
}
