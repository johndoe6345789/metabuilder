/**
 * DBAL Proxy Route (Docker fallback)
 *
 * Forwards requests to the C++ DBAL REST API.
 * URL pattern: /api/dbal/{tenant}/{package}/{entity}[/{id}]
 *
 * useDBAL prefers calling the C++ daemon directly via NEXT_PUBLIC_DBAL_API_URL.
 * This proxy is the fallback when the daemon isn't browser-accessible
 * (e.g. internal Docker network: http://dbal:8080).
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const DBAL_URL =
  process.env.DBAL_ENDPOINT ??
  process.env.DBAL_API_URL ??
  process.env.NEXT_PUBLIC_DBAL_API_URL ??
  'http://localhost:8080'

interface RouteParams {
  params: Promise<{ slug: string[] }>
}

async function proxy(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const resolvedParams = await params
  const path = resolvedParams.slug.join('/')
  const search = request.nextUrl.search
  const targetUrl = `${DBAL_URL}/${path}${search}`

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
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
