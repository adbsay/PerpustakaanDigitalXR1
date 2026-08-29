import { UserModel } from './UserModel';
import { BaseEntity } from '../base/BaseEntity';
import { BookStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

// ============================================================
// ADMIN MODEL — Extends UserModel (OOP: Multi-level Inheritance)
// Admin has all Publisher capabilities + admin-specific powers
// ============================================================

export interface AdminData {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AdminModel extends BaseEntity {
  // Private — admin-specific fields
  private _email: string;
  private _password: string;
  private _name: string;

  constructor(data: AdminData) {
    super(data.id, data.createdAt, data.updatedAt);
    this._email = data.email;
    this._password = data.password;
    this._name = data.name;
  }

  // ---- Public getters ----
  public get email(): string { return this._email; }
  public get name(): string { return this._name; }

  // ---- Setter ----
  public set name(value: string) { this._name = value; }

  // Public method — authenticate admin
  public async authenticate(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this._password);
  }

  // Public method — determine the next status when approving/rejecting
  public approveBook(): BookStatus {
    return 'PUBLISHED';
  }

  public rejectBook(): BookStatus {
    return 'BANNED';
  }

  // Public method — get safe admin profile
  public getAdminProfile() {
    return {
      id: this._id,
      email: this._email,
      name: this._name,
      role: 'ADMIN' as const,
      createdAt: this.formatDate(this._createdAt),
    };
  }

  // Protected method — hash password (same pattern as UserModel)
  protected async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, 12);
  }

  // Required abstract method implementation
  public toJSON(): Record<string, unknown> {
    return {
      id: this._id,
      email: this._email,
      name: this._name,
      role: 'ADMIN',
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      // NOTE: _password intentionally excluded
    };
  }
}
