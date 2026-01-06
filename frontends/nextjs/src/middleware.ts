/**
 * Next.js Middleware
 * 
 * Handles multi-tenant routing at the edge.
 * Routes: /{tenant}/{package}/... are treated as tenant-scoped requests.
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isReservedPath } from '@/lib/routing/route-parser'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip reserved paths
  const firstSegment = pathname.split('/')[1]
  if (firstSegment === undefined || firstSegment.length === 0 || isReservedPath(firstSegment)) {
    return NextResponse.next()
  }

  // Check if this looks like a tenant route: /{tenant}/{package}/...
  const segments = pathname.split('/').filter(Boolean)
  
  if (segments.length >= 2) {
    // Looks like a tenant route
    const tenant = segments[0]
    const pkg = segments[1]

    // Add tenant info to headers for downstream use
    const response = NextResponse.next()
    if (tenant !== undefined && tenant.length > 0) {
      response.headers.set('x-tenant-id', tenant)
    }
    if (pkg !== undefined && pkg.length > 0) {
      response.headers.set('x-package-id', pkg)
    }
    
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
