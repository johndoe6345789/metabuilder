import { NextResponse } from 'next/server'

/**
 * GET /api/dbal/ping
 * Health check for DBAL API
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'dbal',
    timestamp: new Date().toISOString(),
  })
}
