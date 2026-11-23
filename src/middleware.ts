import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Interceptar todas as rotas /admin/* exceto /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionCookie = request.cookies.get('rev_admin_session')?.value;

    if (!sessionCookie) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Se já autenticado e tentar acessar /admin/login, redirecionar para /admin
  if (pathname === '/admin/login') {
    const sessionCookie = request.cookies.get('rev_admin_session')?.value;
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
