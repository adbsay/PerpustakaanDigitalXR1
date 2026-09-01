import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { verifyPublisherAuth, verifyAdminAuth } from '@/lib/auth';

type Params = { params: Promise<{ path: string[] }> };

const MIME_MAP: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { path: segments } = await params;
    if (!segments || segments.length === 0) {
      return new NextResponse('Not found', { status: 404 });
    }

    const categoryFolder = segments[0]; // e.g. 'pdfs', 'covers', 'avatars', 'banners', 'categories'
    const filename = segments.slice(1).join('/');
    const relUploadPath = segments.join('/');

    // 1. Path Traversal Guard
    const baseDir = path.join(process.cwd(), 'private-uploads');
    const resolvedPath = path.normalize(path.join(baseDir, relUploadPath));

    if (!resolvedPath.startsWith(baseDir + path.sep)) {
      return new NextResponse('Invalid path', { status: 400 });
    }

    // 2. Authorization check for PDFs
    if (categoryFolder === 'pdfs') {
      // Find book matching this pdfFile path
      const book = await prisma.book.findFirst({
        where: {
          OR: [
            { pdfFile: `/api/files/${relUploadPath}` },
            { pdfFile: `/uploads/${relUploadPath}` },
            { pdfFile: { contains: filename } },
          ],
        },
      });

      if (book && book.status !== 'PUBLISHED') {
        const publisher = await verifyPublisherAuth(req);
        const admin = await verifyAdminAuth(req);

        const isOwner = publisher && publisher.id === book.publisherId;
        const isAdmin = Boolean(admin);

        if (!isOwner && !isAdmin) {
          return new NextResponse('File tidak ditemukan atau akses terbatas.', { status: 404 });
        }
      }
    }

    // 3. Resolve file strictly from private-uploads
    let filePath = resolvedPath;
    if (!existsSync(filePath)) {
      // Fallback for legacy items in case they exist in root uploads
      const fallbackPath = path.normalize(path.join(process.cwd(), 'uploads', relUploadPath));
      if (fallbackPath.startsWith(path.join(process.cwd(), 'uploads') + path.sep) && existsSync(fallbackPath)) {
        filePath = fallbackPath;
      } else {
        return new NextResponse('File not found', { status: 404 });
      }
    }

    const ext = path.extname(filename).toLowerCase();
    const contentType = MIME_MAP[ext] || 'application/octet-stream';

    const data = await readFile(filePath);

    // Support range requests or return full buffer
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': ext === '.pdf' ? `inline; filename="${path.basename(filename)}"` : 'inline',
        'Cache-Control': categoryFolder === 'pdfs' ? 'private, no-cache' : 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('File serving error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
