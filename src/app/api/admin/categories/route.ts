import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth, successResponse, errorResponse } from '@/lib/auth';

// GET /api/admin/categories
export async function GET(req: NextRequest) {
  const admin = await verifyAdminAuth(req);
  if (!admin) return errorResponse('Unauthorized', 401);

  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { books: true } } }
    });
    return successResponse(categories);
  } catch (error) {
    return errorResponse('Failed to fetch categories');
  }
}

// POST /api/admin/categories
export async function POST(req: NextRequest) {
  const admin = await verifyAdminAuth(req);
  if (!admin) return errorResponse('Unauthorized', 401);

  try {
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const iconFile = formData.get('icon') as File | null;
    
    if (!name) return errorResponse('Name is required');

    let iconPath = null;
    if (iconFile) {
      if (!iconFile.name.toLowerCase().endsWith('.svg') && iconFile.type !== 'image/svg+xml') {
        return errorResponse('Hanya file SVG yang diperbolehkan untuk ikon');
      }

      const bytes = await iconFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = join(process.cwd(), 'public', 'uploads', 'categories');
      await mkdir(uploadDir, { recursive: true });

      const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const filename = `${cleanName}-${Date.now()}.svg`;
      const filepath = join(uploadDir, filename);

      await writeFile(filepath, buffer);
      iconPath = `/uploads/categories/${filename}`;
    }

    const category = await prisma.category.create({
      data: { 
        name,
        icon: iconPath
      }
    });

    // Log the audit
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: 'CREATE_CATEGORY',
        details: `Created category: ${name}`
      }
    });

    return successResponse(category, 201);
  } catch (error: any) {
    console.error('Category creation error:', error);
    return errorResponse(error.message || 'Failed to create category');
  }
}

// DELETE /api/admin/categories
export async function DELETE(req: NextRequest) {
  const admin = await verifyAdminAuth(req);
  if (!admin) return errorResponse('Unauthorized', 401);

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return errorResponse('ID is required');

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return errorResponse('Category not found');

    await prisma.category.delete({ where: { id } });

    // Log the audit
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: 'DELETE_CATEGORY',
        details: `Deleted category: ${category.name}`
      }
    });

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse('Failed to delete category');
  }
}

// PATCH /api/admin/categories
export async function PATCH(req: NextRequest) {
  const admin = await verifyAdminAuth(req);
  if (!admin) return errorResponse('Unauthorized', 401);

  try {
    const formData = await req.formData();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const iconFile = formData.get('icon') as File | null;
    
    if (!id || !name) return errorResponse('ID and Name are required');

    const existingCategory = await prisma.category.findUnique({ where: { id } });
    if (!existingCategory) return errorResponse('Category not found', 404);

    let iconPath = existingCategory.icon;
    
    if (iconFile) {
      if (!iconFile.name.toLowerCase().endsWith('.svg') && iconFile.type !== 'image/svg+xml') {
        return errorResponse('Hanya file SVG yang diperbolehkan untuk ikon');
      }

      const bytes = await iconFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = join(process.cwd(), 'public', 'uploads', 'categories');
      await mkdir(uploadDir, { recursive: true });

      const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const filename = `${cleanName}-${Date.now()}.svg`;
      const filepath = join(uploadDir, filename);

      await writeFile(filepath, buffer);
      iconPath = `/uploads/categories/${filename}`;
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { 
        name,
        icon: iconPath
      }
    });

    // Log the audit
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: 'UPDATE_CATEGORY',
        details: `Updated category: ${name}`
      }
    });

    return successResponse(updatedCategory);
  } catch (error: any) {
    console.error('Category update error:', error);
    return errorResponse(error.message || 'Failed to update category');
  }
}
