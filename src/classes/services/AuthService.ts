import jwt from 'jsonwebtoken';
import { PublisherRepository } from '../repositories/PublisherRepository';
import { AdminRepository } from '../repositories/AdminRepository';
import { UserModel } from '../models/UserModel';
import { AdminModel } from '../models/AdminModel';

// ============================================================
// AUTH SERVICE — Handles authentication for Publisher & Admin
// ============================================================

export interface JwtPayload {
  id: string;
  email: string;
  role: 'PUBLISHER' | 'ADMIN';
  iat?: number;
  exp?: number;
}

export interface AuthResult {
  token: string;
  user: Record<string, unknown>;
}

export class AuthService {
  private readonly publisherRepository: PublisherRepository;
  private readonly adminRepository: AdminRepository;
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;

  constructor(
    publisherRepository: PublisherRepository,
    adminRepository: AdminRepository,
  ) {
    this.publisherRepository = publisherRepository;
    this.adminRepository = adminRepository;
    this.jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  // ---- Publisher Auth ----

  public async registerPublisher(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }): Promise<AuthResult> {
    const existing = await this.publisherRepository.findByEmail(data.email);
    if (existing) throw new Error('Email already registered');

    const publisher = await this.publisherRepository.create(data);
    const token = this.generateToken(publisher.id, publisher.email, 'PUBLISHER');

    return { token, user: publisher.getProfile() };
  }

  public async loginPublisher(email: string, password: string): Promise<AuthResult> {
    const publisher = await this.publisherRepository.findByEmail(email);
    if (!publisher) throw new Error('Invalid email or password');

    const isValid = await publisher.authenticate(password);
    if (!isValid) throw new Error('Invalid email or password');

    if (!publisher.isActive()) throw new Error('Your account has been banned');

    const token = this.generateToken(publisher.id, publisher.email, 'PUBLISHER');
    return { token, user: publisher.getProfile() };
  }

  // ---- Admin Auth ----

  public async loginAdmin(email: string, password: string): Promise<AuthResult> {
    const admin = await this.adminRepository.findByEmail(email);
    if (!admin) throw new Error('Invalid email or password');

    const isValid = await admin.authenticate(password);
    if (!isValid) throw new Error('Invalid email or password');

    const token = this.generateToken(admin.id, admin.email, 'ADMIN');
    return { token, user: admin.getAdminProfile() };
  }

  // ---- Token utilities ----

  public verifyToken(token: string): JwtPayload {
    return jwt.verify(token, this.jwtSecret) as JwtPayload;
  }

  public async getPublisherFromToken(token: string): Promise<UserModel | null> {
    const payload = this.verifyToken(token);
    if (payload.role !== 'PUBLISHER') return null;
    return this.publisherRepository.findById(payload.id);
  }

  public async getAdminFromToken(token: string): Promise<AdminModel | null> {
    const payload = this.verifyToken(token);
    if (payload.role !== 'ADMIN') return null;
    return this.adminRepository.findById(payload.id);
  }

  // Private token generator
  private generateToken(id: string, email: string, role: 'PUBLISHER' | 'ADMIN'): string {
    return jwt.sign({ id, email, role }, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions);
  }
}
