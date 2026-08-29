import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/auth';

// GET /api/admin/auth/me
export async function GET(req: NextRequest) {
  const { createAuthService, extractToken } = await import('@/lib/auth');
  const token = extractToken(req);
  if (!token) return errorResponse('Not authenticated', 401);

  try {
    const authService = createAuthService();
    const admin = await authService.getAdminFromToken(token);
    if (!admin) return errorResponse('Not authenticated', 401);
    return successResponse(admin.getAdminProfile());
  } catch {
    return errorResponse('Invalid token', 401);
  }
}

// POST /api/admin/auth/logout
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_token', '', {
    expires: new Date(0),
    path: '/',
  });
  return response;
}
