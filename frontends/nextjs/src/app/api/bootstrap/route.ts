/**
 * Bootstrap API endpoint
 *
 * One-time setup endpoint to initialize the database with seed data.
 * Call this endpoint once after deployment to bootstrap the system.
 *
 * POST /api/bootstrap
 */

import { NextResponse } from 'next/server'
import { getDBALClient, seedDatabase } from '@/dbal'

export async function POST() {
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
