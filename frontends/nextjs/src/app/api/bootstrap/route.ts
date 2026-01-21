/**
 * Bootstrap API endpoint
 *
 * One-time setup endpoint to initialize the database with seed data.
 * Call this endpoint once after deployment to bootstrap the system.
 *
 * Rate limited to 1 request per hour per IP to prevent spam.
 *
 * POST /api/bootstrap
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getDBALClient, seedDatabase } from '@/dbal'
import { applyRateLimit } from '@/lib/middleware'

export async function POST(request: NextRequest) {
  // Apply strict rate limiting: 1 request per hour
  const limitResponse = applyRateLimit(request, 'bootstrap')
  if (limitResponse) {
    return limitResponse
  }

  try {
    const client = getDBALClient()
    await seedDatabase(client)

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Bootstrap failed:', message)

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    )
  }
}
