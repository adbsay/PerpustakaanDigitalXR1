import { NextRequest } from 'next/server';
import {
  createBookRepository,
  verifyPublisherAuth,
  successResponse,
  errorResponse,
} from '@/lib/auth';
import { BookService } from '@/classes/services/BookService';
import { saveFile, generateFilename, parseFormData, deleteFile } from '@/lib/utils';

type Params = { params: Promise<{ id: string }> };

// GET /api/publisher/books/[id]
export async function GET(req: NextRequest, { params }: Params) {
  const publisher = await verifyPublisherAuth(req);
  if (!publisher) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const bookService = new BookService(createBookRepository());
  const book = await bookService.getBookById(id);

  if (!book || book.publisherId !== publisher.id) {
    return errorResponse('Book not found', 404);
  }

  return successResponse(book.toJSON());
}

// PUT /api/publisher/books/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  const publisher = await verifyPublisherAuth(req);
  if (!publisher) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const bookService = new BookService(createBookRepository());
  const existing = await bookService.getBookById(id);

  if (!existing || existing.publisherId !== publisher.id) {
    return errorResponse('Book not found', 404);
  }

  try {
    const { fields, files } = await parseFormData(req);
    const { title, author, categoryId, description } = fields;
    const updateData: Record<string, string | undefined> = { title, author, categoryId, description };

    if (files.coverImage) {
      if (existing.coverImage) deleteFile(existing.coverImage);
      const filename = generateFilename(files.coverImage.originalName);
      updateData.coverImage = await saveFile(files.coverImage.buffer, filename, 'covers');
    }

    if (files.pdfFile) {
      if (existing.pdfFile) deleteFile(existing.pdfFile);
      const filename = generateFilename(files.pdfFile.originalName);
      updateData.pdfFile = await saveFile(files.pdfFile.buffer, filename, 'pdfs');
    }

    const book = await bookService.updateBook(id, updateData);
    return successResponse(book.toJSON());
  } catch (error) {
    return errorResponse('Failed to update book');
  }
}

// DELETE /api/publisher/books/[id]
export async function DELETE(req: NextRequest, { params }: Params) {
  const publisher = await verifyPublisherAuth(req);
  if (!publisher) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const bookService = new BookService(createBookRepository());
  const existing = await bookService.getBookById(id);

  if (!existing || existing.publisherId !== publisher.id) {
    return errorResponse('Book not found', 404);
  }

  // Clean up uploaded files
  if (existing.coverImage) deleteFile(existing.coverImage);
  if (existing.pdfFile) deleteFile(existing.pdfFile);

  await bookService.deleteBook(id);
  return successResponse({ deleted: true });
}
