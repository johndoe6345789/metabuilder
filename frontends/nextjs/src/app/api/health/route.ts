import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/health
 * Basic health check endpoint for monitoring.
 * Does not expose internal system details.
 */
export function GET(_request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}
