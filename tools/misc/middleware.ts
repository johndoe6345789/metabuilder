import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes that require authentication
const protectedRoutes = [
  '/(auth)/dashboard',
  '/(auth)/admin',
  '/(auth)/builder',
  '/(auth)/supergod',
]

// Public routes that don't require authentication
const publicRoutes = ['/', '/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route.replace('/(auth)', ''))
  )
  
  // Check if current route is public
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/api')
  
  // Get session cookie
  const session = request.cookies.get('session')?.value
  
  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // Redirect to dashboard if accessing login with active session
  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
