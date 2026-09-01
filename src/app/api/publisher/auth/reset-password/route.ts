import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || '';

// POST /api/publisher/auth/reset-password
export async function POST(req: NextRequest) {
  // Rate limit: 5 attempts per 15 minutes per IP
  const ip = getClientIp(req);
  const rateLimitResult = checkRateLimit(`reset-pwd:${ip}`, { windowMs: 15 * 60 * 1000, max: 5 });
  if (!rateLimitResult.success) {
    return errorResponse(`Terlalu banyak percobaan. Coba lagi dalam ${rateLimitResult.retryAfter} detik`, 429);
  }

  try {
    const { token, newPassword } = await req.json();

    if (!token) {
      return errorResponse('Token reset password tidak ditemukan', 400);
    }

    if (!newPassword || newPassword.length < 6) {
      return errorResponse('Password baru minimal 6 karakter', 400);
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return errorResponse('Token reset password tidak valid atau sudah kedaluwarsa', 400);
    }

    if (!decoded || decoded.purpose !== 'password_reset' || !decoded.id) {
      return errorResponse('Token tidak sah untuk reset password', 400);
    }

    // Check publisher
    const publisher = await prisma.publisher.findUnique({
      where: { id: decoded.id },
    });

    if (!publisher) {
      return errorResponse('Akun penerbit tidak ditemukan', 404);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.publisher.update({
      where: { id: decoded.id },
      data: { password: hashedPassword },
    });

    return successResponse({
      message: 'Password berhasil diubah. Silakan masuk dengan password baru Anda.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return errorResponse('Gagal memperbarui password', 500);
  }
}
