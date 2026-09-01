import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLISHER_PUBLIC_PATHS = [
  '/publisher',
  '/publisher/tentang-kami',
  '/publisher/faq',
  '/publisher/kontak',
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Admin route protection
  if (pathname.startsWith('/admin')) {
    const isAuthRoute = pathname.startsWith('/admin/auth');
    const adminToken = request.cookies.get('admin_token')?.value;
    const isAuthenticated = !!adminToken;

    if (!isAuthenticated && !pathname.startsWith('/admin/auth/login')) {
      const loginUrl = new URL('/admin/auth/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAuthenticated && pathname.startsWith('/admin/auth/login')) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  // 2. Publisher route protection
  if (pathname.startsWith('/publisher')) {
    const isAuthRoute = pathname.startsWith('/publisher/auth');
    const isPublicPath = PUBLISHER_PUBLIC_PATHS.includes(pathname);
    const publisherToken = request.cookies.get('publisher_token')?.value;

    if (!isAuthRoute && !isPublicPath && !publisherToken) {
      const loginUrl = new URL('/publisher/auth/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAuthRoute && publisherToken) {
      return NextResponse.redirect(new URL('/publisher/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/publisher/:path*',
  ],
};
