import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_PATHS = ['/dashboard', '/events']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('sportival_token')?.value

  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p))
  const isLoginPath = pathname === '/login'

  if (isAdminPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isLoginPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
