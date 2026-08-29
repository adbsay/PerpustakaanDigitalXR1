import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// POST /api/publisher/auth/logout
export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.set('publisher_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return response;
}

// GET /api/publisher/auth/me
export async function GET(req: NextRequest) {
  const { createAuthService, errorResponse, successResponse, extractToken } = await import('@/lib/auth');
  const token = extractToken(req);

  if (!token) return errorResponse('Not authenticated', 401);

  try {
    const authService = createAuthService();
    const publisher = await authService.getPublisherFromToken(token);
    if (!publisher) return errorResponse('Not authenticated', 401);
    if (!publisher.isActive()) return errorResponse('BANNED', 403);
    return successResponse(publisher.getProfile());
  } catch {
    return errorResponse('Invalid token', 401);
  }
}
