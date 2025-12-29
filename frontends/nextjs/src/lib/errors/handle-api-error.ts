import { NextResponse } from 'next/server'

import { DBALError } from '@/dbal/development/src/core/foundation/errors'

import { formatError } from './format-error'

export interface APIErrorResponse {
  error: string
  code?: number
  details?: Record<string, unknown>
  timestamp?: string
}

/**
 * Centralized API error handler for consistent error responses
 * Maps DBALError codes to HTTP status codes and returns standardized error responses
 */
export function handleAPIError(error: unknown): NextResponse<APIErrorResponse> {
  const formatted = formatError(error)

  // Determine HTTP status code
  let status = 500
  if (error instanceof DBALError) {
    // Map DBALErrorCode to HTTP status
    // Codes < 1000 are standard HTTP codes, use them directly
    status = error.code < 1000 ? error.code : 500
  }

  // Create response
  const response: APIErrorResponse = {
    error: formatted.message,
    code: formatted.code,
    timestamp: new Date().toISOString(),
  }

  // Add details in development only
  if (process.env.NODE_ENV === 'development' && formatted.details) {
    response.details = formatted.details
  }

  // Log error server-side
  console.error('[API Error]', {
    message: formatted.message,
    code: formatted.code,
    stack: formatted.stack,
  })

  return NextResponse.json(response, { status })
}
