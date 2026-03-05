import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function authMiddleware(req: NextRequest) {
  const token =
    req.cookies.get('token')?.value ??
    req.headers.get('authorization')?.replace('Bearer ', '');

  if (!token)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const payload = verifyToken(token);
    // Forward user info to route handlers via headers
    const res = NextResponse.next();
    res.headers.set('x-user-id', payload.userId);
    res.headers.set('x-user-role', payload.role);
    return res;
  } catch {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 },
    );
  }
}
