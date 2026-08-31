import { NextRequest } from 'next/server';
import {
  createBookRepository,
  verifyAdminAuth,
  successResponse,
  errorResponse,
} from '@/lib/auth';
import { BookService } from '@/classes/services/BookService';

// GET /api/admin/books — get all books with optional search and status filter
export async function GET(req: NextRequest) {
  const admin = await verifyAdminAuth(req);
  if (!admin) return errorResponse('Unauthorized', 401);

  try {
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || undefined;
    const status = url.searchParams.get('status') || undefined;

    const bookService = new BookService(createBookRepository());
    const books = await bookService.adminSearchBooks(search, status);
    return successResponse(books.map(b => b.toJSON()));
  } catch {
    return errorResponse('Failed to fetch books');
  }
}
