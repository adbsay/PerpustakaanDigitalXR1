import { NextRequest } from 'next/server';
import {
  createBookRepository,
  verifyAdminAuth,
  successResponse,
  errorResponse,
} from '@/lib/auth';
import { BookService } from '@/classes/services/BookService';
import { AdminModel } from '@/classes/models/AdminModel';

type Params = { params: Promise<{ id: string }> };

// PATCH /api/admin/books/[id] — update status (approve/reject/ban)
export async function PATCH(req: NextRequest, { params }: Params) {
  const admin = await verifyAdminAuth(req);
  if (!admin) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const body = await req.json();
  const { action } = body; // 'approve' | 'reject' | 'ban'

  if (!['approve', 'reject', 'ban'].includes(action)) {
    return errorResponse('Invalid action');
  }

  try {
    const bookService = new BookService(createBookRepository());
    let book;

    if (action === 'approve') {
      book = await bookService.approveBook(id);
    } else {
      book = await bookService.rejectBook(id);
    }

    return successResponse(book.toJSON());
  } catch (error) {
    return errorResponse('Failed to update book status');
  }
}

// DELETE /api/admin/books/[id]
export async function DELETE(req: NextRequest, { params }: Params) {
  const admin = await verifyAdminAuth(req);
  if (!admin) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  try {
    const bookService = new BookService(createBookRepository());
    await bookService.deleteBook(id);
    return successResponse({ deleted: true });
  } catch {
    return errorResponse('Failed to delete book');
  }
}
