/**
 * RESTful API Route Handler
 * 
 * Handles /{tenant}/{package}/{entity}/[...args] routes
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  parseRoute,
  buildDbalOperation,
  getOperation,
  type RouteInfo,
  type DbalOperation,
} from './route-parser'

export interface RestfulContext {
  route: RouteInfo
  operation: string
  dbalOp: DbalOperation
  body?: Record<string, unknown>
  query: Record<string, string>
}

/**
 * Parse a Next.js request into RestfulContext
 */
export async function parseRestfulRequest(
  request: NextRequest,
  params: { slug: string[] }
): Promise<RestfulContext | { error: string; status: number }> {
  const route = parseRoute(params.slug)

  if (!route.valid) {
    return { error: route.error || 'Invalid route', status: 400 }
  }

  // Parse query params
  const query: Record<string, string> = {}
  request.nextUrl.searchParams.forEach((value, key) => {
    query[key] = value
  })

  // Parse body for POST/PUT/PATCH
  let body: Record<string, unknown> | undefined
  const method = request.method.toUpperCase()
  
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    try {
      const text = await request.text()
      if (text) {
        body = JSON.parse(text)
      }
    } catch {
      // Body parsing failed, continue without body
    }
  }

  const operation = getOperation(method, route)
  const dbalOp = buildDbalOperation(route, method, body, query)

  return {
    route,
    operation,
    dbalOp,
    body,
    query,
  }
}

/**
 * Create a success response
 */
export function successResponse(data: unknown, status = 200): NextResponse {
  return NextResponse.json(
    { success: true, data },
    { status }
  )
}

/**
 * Create an error response
 */
export function errorResponse(message: string, status = 400): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  )
}

/**
 * Standard REST response codes
 */
export const STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
} as const
