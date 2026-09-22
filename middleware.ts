import { NextResponse, type NextRequest } from 'next/server';
import { readSession } from '@/lib/session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/login')) return NextResponse.next();
  const session = await readSession(req.cookies.get('session')?.value);
  if (session) return NextResponse.next();
  if (pathname.startsWith('/api')) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  return NextResponse.redirect(new URL('/login', req.url));
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'] };
