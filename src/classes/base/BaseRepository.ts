import { PrismaClient } from '@prisma/client';

// ============================================================
// BASE REPOSITORY — Abstract generic repository
// Implements Repository Pattern (OOP: Abstract class + Generics)
// ============================================================

export abstract class BaseRepository<T> {
  protected readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Abstract CRUD methods — all repositories must implement
  public abstract findById(id: string): Promise<T | null>;
  public abstract findAll(): Promise<T[]>;
  public abstract create(data: unknown): Promise<T>;
  public abstract update(id: string, data: unknown): Promise<T>;
  public abstract delete(id: string): Promise<void>;

  // Protected pagination helper — available to all subclass repos
  protected getPaginationArgs(page: number = 1, limit: number = 12) {
    return {
      skip: (page - 1) * limit,
      take: limit,
    };
  }
}
