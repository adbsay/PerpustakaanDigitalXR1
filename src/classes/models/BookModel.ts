import { BookStatus } from '@prisma/client';
import { BaseEntity } from '../base/BaseEntity';

// ============================================================
// BOOK MODEL — Domain model for Ebook entity
// Extends BaseEntity (OOP: Inheritance)
// Uses encapsulation with private fields + public getters
// ============================================================

export interface BookData {
  id: string;
  title: string;
  author: string;
  categoryId: string | null;
  categoryName?: string;
  description: string | null;
  coverImage: string | null;
  pdfFile: string | null;
  status: BookStatus;
  publisherId: string;
  publisherName?: string;
  publisherAvatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
  averageRating?: number;
  totalViews?: number;
}

export class BookModel extends BaseEntity {
  // Private fields — encapsulation
  private _title: string;
  private _author: string;
  private _categoryId: string | null;
  private _categoryName: string | null;
  private _description: string | null;
  private _coverImage: string | null;
  private _pdfFile: string | null;
  private _status: BookStatus;
  private _publisherId: string;
  private _publisherName: string | null;
  private _publisherAvatar: string | null;
  private _averageRating: number;
  private _totalViews: number;

  constructor(data: BookData) {
    super(data.id, data.createdAt, data.updatedAt);
    this._title = data.title;
    this._author = data.author;
    this._categoryId = data.categoryId;
    this._categoryName = data.categoryName ?? null;
    this._description = data.description;
    this._coverImage = data.coverImage;
    this._pdfFile = data.pdfFile;
    this._status = data.status;
    this._publisherId = data.publisherId;
    this._publisherName = data.publisherName ?? null;
    this._publisherAvatar = data.publisherAvatar ?? null;
    this._averageRating = data.averageRating ?? 0;
    this._totalViews = data.totalViews ?? 0;
  }

  // ---- Public getters (encapsulation) ----
  public get title(): string { return this._title; }
  public get author(): string { return this._author; }
  public get categoryId(): string | null { return this._categoryId; }
  public get categoryName(): string | null { return this._categoryName; }
  public get description(): string | null { return this._description; }
  public get coverImage(): string | null { return this._coverImage; }
  public get pdfFile(): string | null { return this._pdfFile; }
  public get status(): BookStatus { return this._status; }
  public get publisherId(): string { return this._publisherId; }
  public get publisherName(): string | null { return this._publisherName; }
  public get publisherAvatar(): string | null { return this._publisherAvatar; }
  public get averageRating(): number { return this._averageRating; }
  public get totalViews(): number { return this._totalViews; }

  // ---- Public setters (only mutable fields) ----
  public set title(value: string) { this._title = value; }
  public set author(value: string) { this._author = value; }
  public set categoryId(value: string | null) { this._categoryId = value; }
  public set description(value: string | null) { this._description = value; }
  public set coverImage(value: string | null) { this._coverImage = value; }
  public set pdfFile(value: string | null) { this._pdfFile = value; }
  public set status(value: BookStatus) {
    this.validateStatus(value);
    this._status = value;
  }

  // Public method — get safe public info for visitor (no PDF path for banned books)
  public getPublicInfo() {
    return {
      id: this._id,
      title: this._title,
      author: this._author,
      categoryId: this._categoryId,
      categoryName: this._categoryName,
      description: this._description,
      coverImage: this._coverImage,
      pdfFile: this._status === 'PUBLISHED' ? this._pdfFile : null,
      status: this._status,
      publisherId: this._publisherId,
      publisherName: this._publisherName,
      publisherAvatar: this._publisherAvatar,
      averageRating: this._averageRating,
      totalViews: this._totalViews,
      views: this._totalViews,
      createdAt: this.formatDate(this._createdAt),
    };
  }

  // Public method — check if book is accessible to visitors
  public isAccessible(): boolean {
    return this._status === 'PUBLISHED';
  }

  // Public method — get star rating display string
  public getStarDisplay(): string {
    const stars = Math.round(this._averageRating);
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
  }

  // Protected method — validate status transitions (encapsulation)
  protected validateStatus(status: BookStatus): void {
    const validStatuses: BookStatus[] = ['PENDING', 'PUBLISHED', 'BANNED'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid book status: ${status}`);
    }
  }

  // Required abstract method implementation
  public toJSON(): Record<string, unknown> {
    return {
      id: this._id,
      title: this._title,
      author: this._author,
      categoryId: this._categoryId,
      categoryName: this._categoryName,
      description: this._description,
      coverImage: this._coverImage,
      pdfFile: this._pdfFile,
      status: this._status,
      publisherId: this._publisherId,
      publisherName: this._publisherName,
      publisherAvatar: this._publisherAvatar,
      averageRating: this._averageRating,
      totalViews: this._totalViews,
      views: this._totalViews,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
