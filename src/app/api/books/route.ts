import { NextRequest } from 'next/server';
import { createBookRepository, successResponse, errorResponse } from '@/lib/auth';
import { BookService } from '@/classes/services/BookService';

// GET /api/books — public books listing (no auth required)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');

    const bookService = new BookService(createBookRepository());
    const books = search
      ? await bookService.searchBooks(search)
      : await bookService.getPublishedBooks(page, limit);

    return successResponse(books.map(b => b.getPublicInfo()));
  } catch {
    return errorResponse('Failed to fetch books');
  }
}
