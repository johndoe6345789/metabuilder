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

  const isRetiredRoute =
    pathname === '/ui/login' ||
    pathname === '/app' ||
    pathname.startsWith('/app/')

  if (isRetiredRoute) {
    return new NextResponse('Not Found', { status: 404 })
  }

  // Skip reserved paths. .at() is typed `string | undefined` under both
  // tsconfig variants (unlike indexing split()'s `string[]`), and an empty
  // pathname genuinely produces a 1-element array at runtime.
  const firstSegment = pathname.split('/').at(1)
  if (
    firstSegment === undefined ||
    firstSegment.length === 0 ||
    isReservedPath(firstSegment)
  ) {
    return NextResponse.next()
  }

  // Check if this looks like a tenant route: /{tenant}/{package}/...
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length >= 2) {
    // Looks like a tenant route. .at() is typed `string | undefined`
    // under both tsconfig variants (unlike destructuring from
    // split()'s `string[]`, which strict mode cannot correlate with
    // the length check above even though it guarantees both exist).
    const tenant = segments.at(0) ?? ''
    const pkg = segments.at(1) ?? ''

    // On the *request*, which is what "downstream" means: these were set
    // on NextResponse.next()'s own headers, so nothing in the app could
    // read them -- a server component asking for x-tenant-id got null and
    // fell back to "system" -- while both ids were echoed to the browser
    // on every response. Forwarding needs the request headers handed to
    // next() explicitly.
    const forwarded = new Headers(request.headers)
    if (tenant.length > 0) forwarded.set('x-tenant-id', tenant)
    if (pkg.length > 0) forwarded.set('x-package-id', pkg)

    return NextResponse.next({ request: { headers: forwarded } })
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
