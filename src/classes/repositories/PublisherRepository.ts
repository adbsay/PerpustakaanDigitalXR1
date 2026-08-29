import { PrismaClient, PublisherStatus } from '@prisma/client';
import { BaseRepository } from '../base/BaseRepository';
import { UserModel, PublisherData } from '../models/UserModel';
import bcrypt from 'bcryptjs';

// ============================================================
// PUBLISHER REPOSITORY — Concrete BaseRepository implementation
// Handles all DB operations for Publisher entities
// ============================================================

export interface CreatePublisherInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface UpdatePublisherInput {
  name?: string;
  phone?: string;
  avatar?: string;
  status?: PublisherStatus;
  password?: string;
}

export class PublisherRepository extends BaseRepository<UserModel> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  // ---- Required abstract implementations ----

  public async findById(id: string): Promise<UserModel | null> {
    const publisher = await this.prisma.publisher.findUnique({
      where: { id },
      include: { _count: { select: { books: true } } },
    });
    if (!publisher) return null;
    return this.mapToModel(publisher);
  }

  public async findAll(): Promise<UserModel[]> {
    const publishers = await this.prisma.publisher.findMany({
      include: { _count: { select: { books: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return publishers.map(this.mapToModel);
  }

  public async create(data: CreatePublisherInput): Promise<UserModel> {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const publisher = await this.prisma.publisher.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
      },
      include: { _count: { select: { books: true } } },
    });
    return this.mapToModel(publisher);
  }

  public async update(id: string, data: UpdatePublisherInput): Promise<UserModel> {
    const updateData: Record<string, unknown> = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }
    const publisher = await this.prisma.publisher.update({
      where: { id },
      data: updateData,
      include: { _count: { select: { books: true } } },
    });
    return this.mapToModel(publisher);
  }

  public async delete(id: string): Promise<void> {
    await this.prisma.publisher.delete({ where: { id } });
  }

  // ---- Public domain-specific methods ----

  public async findByEmail(email: string): Promise<UserModel | null> {
    const publisher = await this.prisma.publisher.findUnique({
      where: { email },
      include: { _count: { select: { books: true } } },
    });
    if (!publisher) return null;
    return this.mapToModel(publisher);
  }

  public async findActive(): Promise<UserModel[]> {
    const publishers = await this.prisma.publisher.findMany({
      where: { status: 'ACTIVE' },
      include: { _count: { select: { books: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return publishers.map(this.mapToModel);
  }

  public async findBanned(): Promise<UserModel[]> {
    const publishers = await this.prisma.publisher.findMany({
      where: { status: 'BANNED' },
      include: { _count: { select: { books: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return publishers.map(this.mapToModel);
  }

  public async countAll(): Promise<number> {
    return this.prisma.publisher.count();
  }

  public async countActive(): Promise<number> {
    return this.prisma.publisher.count({ where: { status: 'ACTIVE' } });
  }

  // Private helper — map Prisma record to UserModel
  private mapToModel(publisher: {
    id: string;
    email: string;
    password: string;
    name: string;
    phone: string | null;
    avatar: string | null;
    status: PublisherStatus;
    createdAt: Date;
    updatedAt: Date;
    _count?: { books: number };
  }): UserModel {
    const data: PublisherData = {
      id: publisher.id,
      email: publisher.email,
      password: publisher.password,
      name: publisher.name,
      phone: publisher.phone,
      avatar: publisher.avatar,
      status: publisher.status,
      createdAt: publisher.createdAt,
      updatedAt: publisher.updatedAt,
      totalBooks: publisher._count?.books ?? 0,
    };
    return new UserModel(data);
  }
}
