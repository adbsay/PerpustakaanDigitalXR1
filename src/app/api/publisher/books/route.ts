import { NextRequest } from 'next/server';
import {
  createBookRepository,
  verifyPublisherAuth,
  successResponse,
  errorResponse,
} from '@/lib/auth';
import { BookService } from '@/classes/services/BookService';
import { saveFile, generateFilename, parseFormData } from '@/lib/utils';

// GET /api/publisher/books — get publisher's own books
export async function GET(req: NextRequest) {
  const publisher = await verifyPublisherAuth(req);
  if (!publisher) return errorResponse('Unauthorized', 401);

  try {
    const bookService = new BookService(createBookRepository());
    const books = await bookService.getPublisherBooks(publisher.id);
    return successResponse(books.map(b => b.toJSON()));
  } catch (error) {
    return errorResponse('Failed to fetch books');
  }
}

// POST /api/publisher/books — upload new book
export async function POST(req: NextRequest) {
  const publisher = await verifyPublisherAuth(req);
  if (!publisher) return errorResponse('Unauthorized', 401);

  try {
    const { fields, files } = await parseFormData(req);
    const { title, author, categoryId, description } = fields;

    if (!title || !author) {
      return errorResponse('Title and author are required');
    }

    let coverImagePath: string | undefined;
    let pdfFilePath: string | undefined;

    if (files.coverImage) {
      const filename = generateFilename(files.coverImage.originalName);
      coverImagePath = await saveFile(files.coverImage.buffer, filename, 'covers');
    }

    if (files.pdfFile) {
      const filename = generateFilename(files.pdfFile.originalName);
      pdfFilePath = await saveFile(files.pdfFile.buffer, filename, 'pdfs');
    }

    const bookService = new BookService(createBookRepository());
    const book = await bookService.createBook({
      title,
      author,
      categoryId,
      description,
      coverImage: coverImagePath,
      pdfFile: pdfFilePath,
      publisherId: publisher.id,
    });

    return successResponse(book.toJSON(), 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create book';
    return errorResponse(message);
  }
}
