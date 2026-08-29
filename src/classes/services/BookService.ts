import { BookRepository, CreateBookInput, UpdateBookInput } from '../repositories/BookRepository';
import { BookModel } from '../models/BookModel';
import { BookStatus } from '@prisma/client';

// ============================================================
// BOOK SERVICE — Business logic layer for Book operations
// Uses BookRepository for data access (OOP: Composition)
// ============================================================

export class BookService {
  private readonly bookRepository: BookRepository;

  constructor(bookRepository: BookRepository) {
    this.bookRepository = bookRepository;
  }

  // ---- Public service methods ----

  public async getPublishedBooks(page?: number, limit?: number): Promise<BookModel[]> {
    return this.bookRepository.findPublished(page, limit);
  }

  public async getAllBooks(): Promise<BookModel[]> {
    return this.bookRepository.findAll();
  }

  public async getBookById(id: string): Promise<BookModel | null> {
    return this.bookRepository.findById(id);
  }

  public async getPublisherBooks(publisherId: string): Promise<BookModel[]> {
    return this.bookRepository.findByPublisher(publisherId);
  }

  public async getPendingBooks(): Promise<BookModel[]> {
    return this.bookRepository.findPending();
  }

  public async searchBooks(query: string): Promise<BookModel[]> {
    if (!query.trim()) return this.bookRepository.findPublished();
    return this.bookRepository.search(query);
  }

  public async createBook(data: CreateBookInput): Promise<BookModel> {
    this.validateBookInput(data);
    return this.bookRepository.create(data);
  }

  public async updateBook(id: string, data: UpdateBookInput): Promise<BookModel> {
    const book = await this.bookRepository.findById(id);
    if (!book) throw new Error('Book not found');
    return this.bookRepository.update(id, data);
  }

  public async deleteBook(id: string): Promise<void> {
    const book = await this.bookRepository.findById(id);
    if (!book) throw new Error('Book not found');
    return this.bookRepository.delete(id);
  }

  public async approveBook(id: string): Promise<BookModel> {
    return this.bookRepository.update(id, { status: 'PUBLISHED' as BookStatus });
  }

  public async rejectBook(id: string): Promise<BookModel> {
    return this.bookRepository.update(id, { status: 'BANNED' as BookStatus });
  }

  public async addRating(bookId: string, score: number): Promise<void> {
    if (score < 1 || score > 5) throw new Error('Rating must be between 1 and 5');
    return this.bookRepository.addRating(bookId, score);
  }

  public async recordView(bookId: string): Promise<void> {
    return this.bookRepository.recordView(bookId);
  }

  public async getStats() {
    const [totalBooks, pendingReviews, totalViews] = await Promise.all([
      this.bookRepository.countAll(),
      this.bookRepository.countPending(),
      this.bookRepository.countTotalViews(),
    ]);
    return { totalBooks, pendingReviews, totalViews };
  }

  // Private validation — business rule enforcement
  private validateBookInput(data: CreateBookInput): void {
    if (!data.title.trim()) throw new Error('Title is required');
    if (!data.author.trim()) throw new Error('Author is required');
    if (!data.publisherId) throw new Error('Publisher ID is required');
  }
}
