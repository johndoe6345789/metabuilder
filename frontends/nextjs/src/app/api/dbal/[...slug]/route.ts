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
 * DBAL does not enforce the ACLs its schemas declare: StyleRule says
 * create is god-only, and an unauthenticated POST created one. A DELETE for
 * a missing row answers 404 rather than 403 on every entity, including User,
 * which means no permission check runs before the lookup. Until the data
 * layer enforces its own rules, anonymous writes stop here.
 *
 * Reads are left open deliberately: published pages are meant to be readable
 * by anyone, and that is what the read ACLs say.
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { fetchSession } from '@/lib/auth/api/fetch-session'
import { SESSION_COOKIE } from '@/app/api/auth/session/route'

const DBAL_URL =
  process.env.DBAL_ENDPOINT ??
  process.env.DBAL_API_URL ??
  process.env.NEXT_PUBLIC_DBAL_API_URL ??
  'http://localhost:8080'

interface RouteParams {
  params: Promise<{ slug: string[] }>
}

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

async function proxy(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const resolvedParams = await params
  const path = resolvedParams.slug.join('/')
  const search = request.nextUrl.search
  const targetUrl = `${DBAL_URL}/${path}${search}`

  // The cookie is httpOnly and set only from a token the data layer has
  // already vouched for, so its presence is not enough -- it is verified on
  // every write rather than trusted because it exists.
  const token = request.cookies.get(SESSION_COOKIE)?.value ?? null
  if (WRITE_METHODS.has(request.method)) {
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
      'Accept': 'application/json',
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
    return NextResponse.json({ success: false, error: message }, { status: 502 })
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
