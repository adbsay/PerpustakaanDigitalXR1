import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';
import { BookRepository } from '@/classes/repositories/BookRepository';
import { PublisherRepository } from '@/classes/repositories/PublisherRepository';
import { AdminRepository } from '@/classes/repositories/AdminRepository';
import { AuthService } from '@/classes/services/AuthService';

// ============================================================
// AUTH UTILITIES — Factory functions for services + JWT helpers
// ============================================================

// Singleton service factory
export function createAuthService(): AuthService {
  return new AuthService(
    new PublisherRepository(prisma),
    new AdminRepository(prisma),
  );
}

export function createBookRepository(): BookRepository {
  return new BookRepository(prisma);
}

export function createPublisherRepository(): PublisherRepository {
  return new PublisherRepository(prisma);
}

export function createAdminRepository(): AdminRepository {
  return new AdminRepository(prisma);
}

// API response helpers
export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// Extract JWT token from cookie or Authorization header
export function extractToken(req: NextRequest): string | null {
  const cookieToken = req.cookies.get('publisher_token')?.value || req.cookies.get('admin_token')?.value || req.cookies.get('token')?.value;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

// Verify publisher auth
export async function verifyPublisherAuth(req: NextRequest) {
  const token = extractToken(req);
  if (!token) return null;

  try {
    const authService = createAuthService();
    const pub = await authService.getPublisherFromToken(token);
    if (!pub || !pub.isActive()) return null;
    return pub;
  } catch {
    return null;
  }
}

// Verify admin auth
export async function verifyAdminAuth(req: NextRequest) {
  const token = extractToken(req);
  if (!token) return null;

  try {
    const authService = createAuthService();
    const admin = await authService.getAdminFromToken(token);
    // Assuming admin is always active unless deleted, but we can check if needed
    return admin;
  } catch {
    return null;
  }
}
