import { NextResponse } from 'next/server'

/**
 * GET /api/dbal/ping
 * Health check for DBAL API
 * Note: Minimal response to avoid service fingerprinting
 */
export function GET(): NextResponse {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}
