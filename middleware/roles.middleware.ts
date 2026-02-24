import { NextRequest, NextResponse } from 'next/server';

export function roleMiddleware(req: NextRequest, allowedRoles: string[]) {
  const role = req.cookies.get('role')?.value;

  if (!role || !allowedRoles.includes(role)) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard'; // fallback page if role not allowed
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
