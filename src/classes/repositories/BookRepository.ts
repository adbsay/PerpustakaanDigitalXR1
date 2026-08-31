import { PrismaClient, BookStatus } from '@prisma/client';
import { BaseRepository } from '../base/BaseRepository';
import { BookModel, BookData } from '../models/BookModel';

// ============================================================
// BOOK REPOSITORY — Concrete implementation of BaseRepository
// Handles all DB operations for Book entities (OOP: Inheritance)
// ============================================================

export interface CreateBookInput {
  title: string;
  author: string;
  categoryId?: string;
  description?: string;
  coverImage?: string;
  pdfFile?: string;
  publisherId: string;
}

export interface UpdateBookInput {
  title?: string;
  author?: string;
  categoryId?: string;
  description?: string;
  coverImage?: string;
  pdfFile?: string;
  status?: BookStatus;
}

export class BookRepository extends BaseRepository<BookModel> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  // ---- Required abstract implementations ----

  public async findById(id: string): Promise<BookModel | null> {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        publisher: { select: { name: true, avatar: true } },
        category: { select: { name: true } },
        ratings: { select: { score: true } },
        _count: { select: { views: true } },
      },
    });
    if (!book) return null;
    return this.mapToModel(book);
  }

  public async findAll(): Promise<BookModel[]> {
    const books = await this.prisma.book.findMany({
      include: {
        publisher: { select: { name: true, avatar: true } },
        category: { select: { name: true } },
        ratings: { select: { score: true } },
        _count: { select: { views: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return books.map(this.mapToModel);
  }

  public async create(data: CreateBookInput): Promise<BookModel> {
    const book = await this.prisma.book.create({
      data: {
        title: data.title,
        author: data.author,
        categoryId: data.categoryId,
        description: data.description,
        coverImage: data.coverImage,
        pdfFile: data.pdfFile,
        publisherId: data.publisherId,
        status: 'PENDING',
      },
      include: {
        publisher: { select: { name: true, avatar: true } },
        category: { select: { name: true } },
        ratings: { select: { score: true } },
        _count: { select: { views: true } },
      },
    });
    return this.mapToModel(book);
  }

  public async update(id: string, data: UpdateBookInput): Promise<BookModel> {
    const book = await this.prisma.book.update({
      where: { id },
      data,
      include: {
        publisher: { select: { name: true, avatar: true } },
        category: { select: { name: true } },
        ratings: { select: { score: true } },
        _count: { select: { views: true } },
      },
    });
    return this.mapToModel(book);
  }

  public async delete(id: string): Promise<void> {
    await this.prisma.book.delete({ where: { id } });
  }

  // ---- Public domain-specific methods ----

  public async findPublished(page?: number, limit?: number): Promise<BookModel[]> {
    const pagination = this.getPaginationArgs(page, limit);
    const books = await this.prisma.book.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        publisher: { select: { name: true, avatar: true } },
        category: { select: { name: true } },
        ratings: { select: { score: true } },
        _count: { select: { views: true } },
      },
      orderBy: { createdAt: 'desc' },
      ...pagination,
    });
    return books.map(this.mapToModel);
  }

  public async findPending(): Promise<BookModel[]> {
    const books = await this.prisma.book.findMany({
      where: { status: 'PENDING' },
      include: {
        publisher: { select: { name: true, avatar: true } },
        category: { select: { name: true } },
        ratings: { select: { score: true } },
        _count: { select: { views: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return books.map(this.mapToModel);
  }

  public async findByPublisher(publisherId: string): Promise<BookModel[]> {
    const books = await this.prisma.book.findMany({
      where: { publisherId },
      include: {
        publisher: { select: { name: true, avatar: true } },
        category: { select: { name: true } },
        ratings: { select: { score: true } },
        _count: { select: { views: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return books.map(this.mapToModel);
  }

  public async search(query: string): Promise<BookModel[]> {
    const books = await this.prisma.book.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { author: { contains: query, mode: 'insensitive' } },
          { category: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: {
        publisher: { select: { name: true, avatar: true } },
        category: { select: { name: true } },
        ratings: { select: { score: true } },
        _count: { select: { views: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return books.map(this.mapToModel);
  }

  public async addRating(bookId: string, score: number): Promise<void> {
    await this.prisma.rating.create({ data: { bookId, score } });
  }

  public async recordView(bookId: string): Promise<void> {
    await this.prisma.bookView.create({ data: { bookId } });
  }

  public async countAll(): Promise<number> {
    return this.prisma.book.count();
  }

  public async countPublished(): Promise<number> {
    return this.prisma.book.count({ where: { status: 'PUBLISHED' } });
  }

  public async countPending(): Promise<number> {
    return this.prisma.book.count({ where: { status: 'PENDING' } });
  }

  public async countTotalViews(): Promise<number> {
    return this.prisma.bookView.count();
  }

  public async adminSearch(query?: string, status?: string): Promise<BookModel[]> {
    const where: any = {};
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { author: { contains: query, mode: 'insensitive' } },
        { publisher: { name: { contains: query, mode: 'insensitive' } } }
      ];
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }
    
    const books = await this.prisma.book.findMany({
      where,
      include: {
        publisher: { select: { name: true, avatar: true } },
        category: { select: { name: true } },
        ratings: { select: { score: true } },
        _count: { select: { views: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return books.map(b => this.mapToModel(b as any));
  }

  // Private helper — map Prisma record to BookModel
  private mapToModel(book: {
    id: string;
    title: string;
    author: string;
    categoryId: string | null;
    description: string | null;
    coverImage: string | null;
    pdfFile: string | null;
    status: BookStatus;
    publisherId: string;
    createdAt: Date;
    updatedAt: Date;
    publisher?: { name: string; avatar?: string | null } | null;
    category?: { name: string } | null;
    ratings?: { score: number }[];
    _count?: { views: number };
  }): BookModel {
    const avgRating =
      book.ratings && book.ratings.length > 0
        ? book.ratings.reduce((sum, r) => sum + r.score, 0) / book.ratings.length
        : 0;

    const bookData: BookData = {
      id: book.id,
      title: book.title,
      author: book.author,
      categoryId: book.categoryId,
      categoryName: book.category?.name,
      description: book.description,
      coverImage: book.coverImage,
      pdfFile: book.pdfFile,
      status: book.status,
      publisherId: book.publisherId,
      publisherName: book.publisher?.name,
      publisherAvatar: book.publisher?.avatar,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
      averageRating: Math.round(avgRating * 10) / 10,
      totalViews: book._count?.views ?? 0,
    };
    return new BookModel(bookData);
  }
}
