import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth, errorResponse } from '@/lib/auth';

// GET /api/admin/export
export async function GET(req: NextRequest) {
  const admin = await verifyAdminAuth(req);
  if (!admin) return errorResponse('Unauthorized', 401);

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'books'; // books or publishers

    if (type === 'books') {
      const books = await prisma.book.findMany({
        include: {
          publisher: { select: { name: true } },
          category: { select: { name: true } },
          _count: { select: { views: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      const csvRows = [
        ['ID', 'Title', 'Author', 'Category', 'Publisher', 'Status', 'Views', 'Created At'].join(','),
        ...books.map(b => [
          b.id,
          `"${b.title.replace(/"/g, '""')}"`,
          `"${b.author.replace(/"/g, '""')}"`,
          `"${b.category?.name || '-'}"`,
          `"${b.publisher.name.replace(/"/g, '""')}"`,
          b.status,
          b._count.views,
          b.createdAt.toISOString()
        ].join(','))
      ];

      return new NextResponse(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="books_export.csv"'
        }
      });
    } else {
      const publishers = await prisma.publisher.findMany({
        include: { _count: { select: { books: true } } },
        orderBy: { createdAt: 'desc' }
      });

      const csvRows = [
        ['ID', 'Name', 'Email', 'Phone', 'Status', 'Total Books', 'Created At'].join(','),
        ...publishers.map(p => [
          p.id,
          `"${p.name.replace(/"/g, '""')}"`,
          p.email,
          p.phone || '-',
          p.status,
          p._count.books,
          p.createdAt.toISOString()
        ].join(','))
      ];

      return new NextResponse(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="publishers_export.csv"'
        }
      });
    }
  } catch (error) {
    return errorResponse('Failed to export data');
  }
}
