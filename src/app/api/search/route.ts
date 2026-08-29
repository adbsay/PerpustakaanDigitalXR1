import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createBookRepository } from '@/lib/auth';
import { BookService } from '@/classes/services/BookService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    
    if (!q) {
      return NextResponse.json({ success: true, data: { categories: [], publishers: [], authors: [], books: [] } });
    }

    const searchQuery = q.trim();

    // 1. Search Categories
    const categories = await prisma.category.findMany({
      where: {
        name: { contains: searchQuery, mode: 'insensitive' }
      },
      select: {
        id: true,
        name: true,
        icon: true,
        _count: { select: { books: true } }
      },
      orderBy: { name: 'asc' },
      take: 8
    });

    // 2. Search Publishers
    const publishers = await prisma.publisher.findMany({
      where: {
        name: { contains: searchQuery, mode: 'insensitive' },
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        _count: { select: { books: true } }
      },
      orderBy: { name: 'asc' },
      take: 8
    });

    // 3. Search Authors (Distinct matching strings from Books)
    const booksWithAuthors = await prisma.book.findMany({
      where: {
        status: 'PUBLISHED',
        author: { contains: searchQuery, mode: 'insensitive' }
      },
      select: { author: true },
      distinct: ['author'],
      take: 12
    });
    const authors = booksWithAuthors.map(b => b.author).sort((a, b) => a.localeCompare(b));

    // 4. Search Books (Re-using BookService search logic)
    const bookService = new BookService(createBookRepository());
    const matchedBooksModels = await bookService.searchBooks(searchQuery);
    const books = matchedBooksModels
      .map(b => b.getPublicInfo())
      .sort((a, b) => a.title.localeCompare(b.title));

    return NextResponse.json({
      success: true,
      data: {
        categories,
        publishers,
        authors,
        books
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ success: false, error: 'Failed to perform search' }, { status: 500 });
  }
}
