import { NextRequest } from 'next/server';
import { createAuthService, successResponse, errorResponse } from '@/lib/auth';

// POST /api/admin/auth/login
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse('Email and password are required');
    }

    const authService = createAuthService();
    const result = await authService.loginAdmin(email, password);

    const response = successResponse(result);
    response.cookies.set('admin_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return errorResponse(message, 401);
  }
}
