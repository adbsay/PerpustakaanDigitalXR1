import { BookRepository } from '../repositories/BookRepository';
import { PublisherRepository } from '../repositories/PublisherRepository';

// ============================================================
// ANALYTICS SERVICE — Aggregates stats for Admin & Publisher
// ============================================================

export interface AdminStats {
  totalBooks: number;
  totalPublishers: number;
  pendingReviews: number;
  totalVisits: number;
  totalStorage: number; // in bytes
}

export interface PublisherStats {
  totalEbooks: number;
  pendingReviews: number;
  recentViews: number;
  averageRating: number;
}

export interface MonthlyViewData {
  month: string;
  views: number;
}

export interface TopBook {
  id: string;
  title: string;
  author: string;
  views: number;
  status: string;
  coverImage?: string;
}

export class AnalyticsService {
  private readonly bookRepository: BookRepository;
  private readonly publisherRepository: PublisherRepository;

  constructor(bookRepository: BookRepository, publisherRepository: PublisherRepository) {
    this.bookRepository = bookRepository;
    this.publisherRepository = publisherRepository;
  }

  public async getAdminStats(): Promise<AdminStats> {
    const [totalBooks, totalPublishers, pendingReviews, totalVisits] = await Promise.all([
      this.bookRepository.countAll(),
      this.publisherRepository.countAll(),
      this.bookRepository.countPending(),
      this.bookRepository.countTotalViews(),
    ]);

    const fs = require('fs/promises');
    const path = require('path');
    let totalStorage = 0;
    try {
      const getDirSize = async (dir: string): Promise<number> => {
        let size = 0;
        try {
          const files = await fs.readdir(dir, { withFileTypes: true });
          for (const file of files) {
            const filePath = path.join(dir, file.name);
            if (file.isDirectory()) {
              size += await getDirSize(filePath);
            } else {
              const stat = await fs.stat(filePath);
              size += stat.size;
            }
          }
        } catch (e) {
          // ignore if dir not found
        }
        return size;
      };

      const privateDir = path.join(process.cwd(), 'private-uploads');
      const publicDir = path.join(process.cwd(), 'public', 'uploads');
      const [privSize, pubSize] = await Promise.all([
        getDirSize(privateDir),
        getDirSize(publicDir)
      ]);
      totalStorage = privSize + pubSize;
    } catch (e) {}

    return { totalBooks, totalPublishers, pendingReviews, totalVisits, totalStorage };
  }

  public async getPublisherStats(publisherId: string): Promise<PublisherStats> {
    const books = await this.bookRepository.findByPublisher(publisherId);
    const totalEbooks = books.length;
    const pendingReviews = books.filter(b => b.status === 'PENDING').length;
    const recentViews = books.reduce((sum, b) => sum + b.totalViews, 0);
    const ratedBooks = books.filter(b => b.averageRating > 0);
    const averageRating = ratedBooks.length > 0
      ? ratedBooks.reduce((sum, b) => sum + b.averageRating, 0) / ratedBooks.length
      : 0;
    return { totalEbooks, pendingReviews, recentViews, averageRating };
  }

  public async getTopPublisherBooks(publisherId: string, limit = 5): Promise<TopBook[]> {
    const books = await this.bookRepository.findByPublisher(publisherId);
    return books
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, limit)
      .map(b => ({
        id: b.id,
        title: b.title,
        author: b.author,
        views: b.totalViews,
        status: b.status,
        coverImage: b.coverImage || undefined,
      }));
  }

  public async getTopPublishers(limit = 5) {
    const publishers = await this.publisherRepository.findAll();
    return publishers
      .sort((a, b) => (b.totalBooks || 0) - (a.totalBooks || 0))
      .slice(0, limit)
      .map(p => ({
        id: p.id,
        name: p.name,
        totalBooks: p.totalBooks,
      }));
  }
}
