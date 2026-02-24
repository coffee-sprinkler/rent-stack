import { NextRequest, NextResponse } from 'next/server';

export function authMiddleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login'; // redirect to login page
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
