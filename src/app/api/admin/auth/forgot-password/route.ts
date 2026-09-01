import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';

// POST /api/admin/auth/forgot-password
export async function POST(req: NextRequest) {
  // Rate limit: 5 requests per 15 minutes per IP
  const ip = getClientIp(req);
  const rateLimitResult = checkRateLimit(`admin-forgot-pwd:${ip}`, { windowMs: 15 * 60 * 1000, max: 5 });
  if (!rateLimitResult.success) {
    return errorResponse(`Terlalu banyak permintaan. Coba lagi dalam ${rateLimitResult.retryAfter} detik`, 429);
  }

  try {
    const { email } = await req.json();
    if (!email || !email.includes('@')) {
      return errorResponse('Email valid diperlukan', 400);
    }

    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // To prevent email enumeration attacks, always return success even if user not found
    if (!admin) {
      return successResponse({
        message: 'Jika email admin terdaftar, instruksi reset password telah disiapkan.',
      });
    }

    // Generate signed reset token valid for 1 hour
    const resetToken = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        purpose: 'admin_password_reset',
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const resetUrl = `${req.nextUrl.origin}/admin/auth/forgot-password?token=${resetToken}`;

    return successResponse({
      message: 'Instruksi reset password admin telah disiapkan.',
      resetUrl,
      token: resetToken,
    });
  } catch (error) {
    console.error('Admin forgot password error:', error);
    return errorResponse('Gagal memproses permintaan reset password admin', 500);
  }
}
