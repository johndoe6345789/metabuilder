import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/health
 * Basic health check endpoint for monitoring and startup verification.
 * Does not perform database operations - use /api/setup for seeding.
 */
export function GET(_request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}
