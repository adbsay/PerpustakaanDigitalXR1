import { NextRequest } from 'next/server';
import { createBookRepository, successResponse, errorResponse } from '@/lib/auth';
import { BookService } from '@/classes/services/BookService';

type Params = { params: Promise<{ id: string }> };

// GET /api/books/[id] — public book detail
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const bookService = new BookService(createBookRepository());
    const book = await bookService.getBookById(id);

    if (!book || !book.isAccessible()) {
      return errorResponse('Book not found', 404);
    }

    // Record the view
    await bookService.recordView(id);

    return successResponse(book.getPublicInfo());
  } catch {
    return errorResponse('Failed to fetch book');
  }
}

// POST /api/books/[id]/rating — add rating (no auth required)
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { score } = body;

    if (!score || score < 1 || score > 5) {
      return errorResponse('Rating must be between 1 and 5');
    }

    const bookService = new BookService(createBookRepository());
    await bookService.addRating(id, parseInt(score));

    return successResponse({ rated: true });
  } catch {
    return errorResponse('Failed to add rating');
  }
}
