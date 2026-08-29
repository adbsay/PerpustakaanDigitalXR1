import { NextRequest } from 'next/server';
import {
  createAuthService,
  successResponse,
  errorResponse,
} from '@/lib/auth';

// POST /api/publisher/auth/register
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, phone } = body;

    if (!email || !password || !name) {
      return errorResponse('Email, password, and name are required');
    }

    if (password.length < 8) {
      return errorResponse('Password must be at least 8 characters');
    }

    const authService = createAuthService();
    const result = await authService.registerPublisher({ email, password, name, phone });

    const response = successResponse(result, 201);
    response.cookies.set('publisher_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return errorResponse(message);
  }
}
