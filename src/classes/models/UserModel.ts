import { PublisherStatus } from '@prisma/client';
import { BaseEntity } from '../base/BaseEntity';
import bcrypt from 'bcryptjs';

// ============================================================
// USER MODEL — Domain model for Publisher entity
// Extends BaseEntity (OOP: Inheritance)
// Implements encapsulation: password is always private
// ============================================================

export interface PublisherData {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  status: PublisherStatus;
  createdAt: Date;
  updatedAt: Date;
  totalBooks?: number;
}

export class UserModel extends BaseEntity {
  // Private fields — strict encapsulation (password never exposed)
  private _email: string;
  private _password: string;
  private _name: string;
  private _phone: string | null;
  private _avatar: string | null;
  private _status: PublisherStatus;
  private _totalBooks: number;

  constructor(data: PublisherData) {
    super(data.id, data.createdAt, data.updatedAt);
    this._email = data.email;
    this._password = data.password;
    this._name = data.name;
    this._phone = data.phone;
    this._avatar = data.avatar;
    this._status = data.status;
    this._totalBooks = data.totalBooks ?? 0;
  }

  // ---- Public getters (password is NOT exposed) ----
  public get email(): string { return this._email; }
  public get name(): string { return this._name; }
  public get phone(): string | null { return this._phone; }
  public get avatar(): string | null { return this._avatar; }
  public get status(): PublisherStatus { return this._status; }
  public get totalBooks(): number { return this._totalBooks; }

  // ---- Public setters ----
  public set name(value: string) { this._name = value; }
  public set phone(value: string | null) { this._phone = value; }
  public set avatar(value: string | null) { this._avatar = value; }
  public set status(value: PublisherStatus) { this._status = value; }

  // Public method — verify password (password stays private)
  public async authenticate(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this._password);
  }

  // Public method — get safe profile (no password)
  public getProfile() {
    return {
      id: this._id,
      email: this._email,
      name: this._name,
      phone: this._phone,
      avatar: this._avatar,
      status: this._status,
      totalBooks: this._totalBooks,
      createdAt: this.formatDate(this._createdAt),
    };
  }

  // Public method — check if publisher is active
  public isActive(): boolean {
    return this._status === 'ACTIVE';
  }

  // Protected method — hash password (accessible to AdminModel via inheritance)
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
      avatar: this._avatar,
      status: this._status,
      totalBooks: this._totalBooks,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      // NOTE: _password intentionally excluded
    };
  }
}
