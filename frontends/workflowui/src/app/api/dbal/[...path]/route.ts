/**
 * DBAL API Proxy Route
 *
 * Proxies requests from the Next.js frontend to the C++ DBAL daemon
 * to avoid CORS issues when developing locally.
 *
 * Pattern: /api/dbal/{tenant}/{package}/{entity}[/{id}]
 * Forwards to: http://localhost:8080/{tenant}/{package}/{entity}[/{id}]
 */

import { NextRequest, NextResponse } from 'next/server'

const DBAL_DAEMON_URL = process.env.DBAL_DAEMON_URL || process.env.DBAL_ENDPOINT || 'http://localhost:8080'

interface RouteContext {
  params: Promise<{
    path: string[]
  }>
}

async function proxyRequest(
  request: NextRequest,
  method: string,
  path: string[]
): Promise<NextResponse> {
  try {
    const pathString = path.join('/')
    const searchParams = request.nextUrl.searchParams.toString()
    const url = `${DBAL_DAEMON_URL}/${pathString}${searchParams ? `?${searchParams}` : ''}`

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Forward authorization headers if present
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    const options: RequestInit = {
      method,
      headers,
    }

    // Add body for POST/PUT/PATCH requests
    if (method !== 'GET' && method !== 'DELETE') {
      const body = await request.text()
      if (body) {
        options.body = body
      }
    }

    const response = await fetch(url, options)
    const data = await response.json()

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('DBAL proxy error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Proxy request failed',
        },
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  return proxyRequest(request, 'GET', path)
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  return proxyRequest(request, 'POST', path)
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  return proxyRequest(request, 'PUT', path)
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  return proxyRequest(request, 'PATCH', path)
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  return proxyRequest(request, 'DELETE', path)
}
