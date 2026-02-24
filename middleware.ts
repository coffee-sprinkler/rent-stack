import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, roleMiddleware } from './middleware/index';

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith('/dashboard')) {
    const authRes = authMiddleware(req);
    if (authRes instanceof Response) return authRes;

    if (pathname.startsWith('/dashboard/maintenance')) {
      const roleRes = roleMiddleware(req, ['admin']);
      if (roleRes instanceof Response) return roleRes;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
