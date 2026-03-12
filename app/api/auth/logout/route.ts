// app/api/auth/logout/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  return NextResponse.redirect(
    new URL(
      '/login',
      process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    ),
  );
}
