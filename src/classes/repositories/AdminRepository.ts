import { PrismaClient } from '@prisma/client';
import { BaseRepository } from '../base/BaseRepository';
import { AdminModel, AdminData } from '../models/AdminModel';
import bcrypt from 'bcryptjs';

// ============================================================
// ADMIN REPOSITORY — Concrete BaseRepository for Admin
// ============================================================

export class AdminRepository extends BaseRepository<AdminModel> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  public async findById(id: string): Promise<AdminModel | null> {
    const admin = await this.prisma.admin.findUnique({ where: { id } });
    if (!admin) return null;
    return this.mapToModel(admin);
  }

  public async findAll(): Promise<AdminModel[]> {
    const admins = await this.prisma.admin.findMany({ orderBy: { createdAt: 'desc' } });
    return admins.map(this.mapToModel);
  }

  public async create(data: { email: string; password: string; name: string }): Promise<AdminModel> {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const admin = await this.prisma.admin.create({
      data: { email: data.email, password: hashedPassword, name: data.name },
    });
    return this.mapToModel(admin);
  }

  public async update(id: string, data: { name?: string; password?: string }): Promise<AdminModel> {
    const updateData: Record<string, unknown> = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }
    const admin = await this.prisma.admin.update({ where: { id }, data: updateData });
    return this.mapToModel(admin);
  }

  public async delete(id: string): Promise<void> {
    await this.prisma.admin.delete({ where: { id } });
  }

  public async findByEmail(email: string): Promise<AdminModel | null> {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin) return null;
    return this.mapToModel(admin);
  }

  private mapToModel(admin: {
    id: string;
    email: string;
    password: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }): AdminModel {
    const data: AdminData = {
      id: admin.id,
      email: admin.email,
      password: admin.password,
      name: admin.name,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
    return new AdminModel(data);
  }
}
