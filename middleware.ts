import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './lib/i18n/routing'
import { ADMIN_LOGIN_PATH, ADMIN_SESSION_COOKIE } from './lib/admin/session'

const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    // Only a quick gate: the CMS checks the session on every request.
    const signedIn = request.cookies.has(ADMIN_SESSION_COOKIE)
    if (!signedIn && pathname !== ADMIN_LOGIN_PATH && !pathname.startsWith('/admin/upload')) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url))
    }
    const response = NextResponse.next()
    response.headers.set('x-robots-tag', 'noindex, nofollow')
    return response
  }
  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|uploads|.*\\..*).*)'],
}
