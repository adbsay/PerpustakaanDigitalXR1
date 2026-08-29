import { NextRequest } from 'next/server';
import {
  createBookRepository,
  verifyAdminAuth,
  successResponse,
  errorResponse,
} from '@/lib/auth';
import { BookService } from '@/classes/services/BookService';

// GET /api/admin/books — get all books
export async function GET(req: NextRequest) {
  const admin = await verifyAdminAuth(req);
  if (!admin) return errorResponse('Unauthorized', 401);

  try {
    const bookService = new BookService(createBookRepository());
    const books = await bookService.getAllBooks();
    return successResponse(books.map(b => b.toJSON()));
  } catch {
    return errorResponse('Failed to fetch books');
  }
}
