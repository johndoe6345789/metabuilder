/**
 * DBAL Proxy Route (Docker fallback)
 *
 * Forwards requests to the C++ DBAL REST API.
 * URL pattern: /api/dbal/{tenant}/{package}/{entity}[/{id}]
 *
 * useDBAL prefers calling the C++ daemon directly via NEXT_PUBLIC_DBAL_API_URL.
 * This proxy is the fallback when the daemon isn't browser-accessible
 * (e.g. internal Docker network: http://dbal:8080). In this deployment that
 * variable is unset, which makes this the only route to the data layer from
 * outside -- and therefore the place where writes have to be authenticated.
 *
 * Anonymous writes stop here, with the narrow exception in
 * public-writes.ts: the entities whose whole purpose is to be created by
 * someone with no account, namely registering and answering a form on a
 * published page. DBAL enforces the same rule a second time and refuses
 * any privileged field an anonymous caller tries to set.
 *
 * Reads are forwarded and left to DBAL, which enforces the read ACLs its
 * schemas declare -- the 21 entities that grant public read are the
 * page-rendering set, so a signed-out visitor still sees a published site,
 * and the rest need a caller. This proxy passes the session token on, so a
 * signed-in reader is read as themselves.
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { fetchSession } from '@/lib/auth/api/fetch-session'
import { SESSION_COOKIE } from '@/app/api/auth/session/route'
import { isPublicWrite } from '../public-writes'

const DBAL_URL =
  process.env.DBAL_ENDPOINT ??
  process.env.DBAL_API_URL ??
  process.env.NEXT_PUBLIC_DBAL_API_URL ??
  'http://localhost:8080'

interface RouteParams {
  params: Promise<{ slug: string[] }>
}

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

/**
 * POST routes that parse or read only -- no tenant data is touched, so the
 * write-auth gate below would otherwise demand a session for a call that
 * changes nothing. bql/parse is DBAL's shared BQL syntax parser (stateless,
 * no dbal::Client): see the dbal repo's bql_route_handler.hpp. Keep this
 * list to routes verified not to write.
 */
const STATELESS_UTILITY_SUFFIXES = ['/bql/parse']

function isStatelessUtility(path: string): boolean {
  return STATELESS_UTILITY_SUFFIXES.some(suffix => path.endsWith(suffix))
}

async function proxy(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const resolvedParams = await params
  const path = resolvedParams.slug.join('/')
  const search = request.nextUrl.search
  const targetUrl = `${DBAL_URL}/${path}${search}`

  // The cookie is httpOnly and set only from a token the data layer has
  // already vouched for, so its presence is not enough -- it is verified on
  // every write rather than trusted because it exists.
  const token = request.cookies.get(SESSION_COOKIE)?.value ?? null
  const needsSession =
    WRITE_METHODS.has(request.method) &&
    !isStatelessUtility(path) &&
    // A visitor booking a repair has no account and never will. DBAL
    // enforces the same rule again, and refuses any privileged field an
    // anonymous caller tries to set -- see public-writes.ts.
    !isPublicWrite(request.method, path)
  if (needsSession) {
    const user = token === null ? null : await fetchSession(token)
    if (user === null) {
      return NextResponse.json(
        { success: false, error: 'Sign in to change data' },
        { status: 401 }
      )
    }
  }

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    }
    // Passed on so the data layer can apply its own rules once it enforces
    // them; today it ignores this.
    if (token !== null) {
      headers.Authorization = `Bearer ${token}`
    }

    if (request.method !== 'GET' && request.method !== 'DELETE') {
      headers['Content-Type'] = 'application/json'
    }

    const body = ['POST', 'PUT', 'PATCH'].includes(request.method)
      ? await request.text()
      : undefined

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    })

    const data = await response.text()

    return new NextResponse(data, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'DBAL proxy error'
    return NextResponse.json(
      { success: false, error: message },
      { status: 502 }
    )
  }
}

export async function GET(request: NextRequest, params: RouteParams) {
  return proxy(request, params)
}

export async function POST(request: NextRequest, params: RouteParams) {
  return proxy(request, params)
}

export async function PUT(request: NextRequest, params: RouteParams) {
  return proxy(request, params)
}

export async function PATCH(request: NextRequest, params: RouteParams) {
  return proxy(request, params)
}

export async function DELETE(request: NextRequest, params: RouteParams) {
  return proxy(request, params)
}
