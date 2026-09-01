import { PublisherStatus } from '@prisma/client';
import { BaseEntity } from '../base/BaseEntity';
import bcrypt from 'bcryptjs';

// ============================================================
// PUBLISHER MODEL — Domain model for Publisher entity
// Extends BaseEntity (OOP: Inheritance)
// Implements encapsulation: password is always private
// ============================================================

export interface PublisherData {
  id: string;
  email: string;
  password?: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  bio?: string | null;
  website?: string | null;
  banner?: string | null;
  status: PublisherStatus;
  createdAt: Date;
  updatedAt: Date;
  totalBooks?: number;
}

export class PublisherModel extends BaseEntity {
  // Private fields — strict encapsulation (password never exposed)
  private _email: string;
  private _password: string;
  private _name: string;
  private _phone: string | null;
  private _avatar: string | null;
  private _bio: string | null | undefined;
  private _website: string | null | undefined;
  private _banner: string | null | undefined;
  private _status: PublisherStatus;
  private _totalBooks: number;

  constructor(data: PublisherData) {
    super(data.id, data.createdAt, data.updatedAt);
    this._email = data.email;
    this._password = data.password ?? '';
    this._name = data.name;
    this._phone = data.phone;
    this._avatar = data.avatar;
    this._bio = data.bio;
    this._website = data.website;
    this._banner = data.banner;
    this._status = data.status;
    this._totalBooks = data.totalBooks ?? 0;
  }

  // ---- Public getters (password is NOT exposed) ----
  public get email(): string { return this._email; }
  public get name(): string { return this._name; }
  public get phone(): string | null { return this._phone; }
  public get avatar(): string | null { return this._avatar; }
  public get bio(): string | null | undefined { return this._bio; }
  public get website(): string | null | undefined { return this._website; }
  public get banner(): string | null | undefined { return this._banner; }
  public get status(): PublisherStatus { return this._status; }
  public get totalBooks(): number { return this._totalBooks; }

  // ---- Public setters ----
  public set name(value: string) { this._name = value; }
  public set phone(value: string | null) { this._phone = value; }
  public set avatar(value: string | null) { this._avatar = value; }
  public set bio(value: string | null | undefined) { this._bio = value; }
  public set website(value: string | null | undefined) { this._website = value; }
  public set banner(value: string | null | undefined) { this._banner = value; }
  public set status(value: PublisherStatus) { this._status = value; }

  // Public method — verify password (password stays private)
  public async authenticate(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this._password);
  }

  public async verifyPassword(plainPassword: string): Promise<boolean> {
    return this.authenticate(plainPassword);
  }

  private normalizeFileUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    return url.replace(/^\/uploads\//, '/api/files/');
  }

  // Public method — get safe profile (no password)
  public getProfile() {
    return {
      id: this._id,
      email: this._email,
      name: this._name,
      phone: this._phone,
      avatar: this.normalizeFileUrl(this._avatar),
      bio: this._bio,
      website: this._website,
      banner: this.normalizeFileUrl(this._banner),
      status: this._status,
      totalBooks: this._totalBooks,
      createdAt: this.formatDate(this._createdAt),
    };
  }

  // Public method — check if publisher is active
  public isActive(): boolean {
    return this._status === 'ACTIVE';
  }

  // Protected method — hash password
  protected async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, 12);
  }

  // Required abstract method implementation
  public toJSON(): Record<string, unknown> {
    return {
      id: this._id,
      email: this._email,
      name: this._name,
      phone: this._phone,
      avatar: this.normalizeFileUrl(this._avatar),
      banner: this.normalizeFileUrl(this._banner),
      status: this._status,
      totalBooks: this._totalBooks,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
