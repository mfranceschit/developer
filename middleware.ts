import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'es', 'pt'],

  // Used when no locale matches
  defaultLocale: 'en',
});

export default function middleware(request: NextRequest) {
  if (request.url.match(/\/admin/)) {
    return NextResponse.next();
  } else {
    return intlMiddleware(request);
  }
}

export const config = {
  // Match only internationalized pathnames
  matcher: [
    '/((?!api|_next/static|_next/image|images|favicon.ico|apple-touch-icon.png).*)',
    '/(en|pt|es)/:path*',
  ],
};
