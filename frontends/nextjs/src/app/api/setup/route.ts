import { NextResponse } from 'next/server'
import { Database } from '@/lib/db/core/operations'

/**
 * POST /api/setup
 * One-time setup endpoint to seed database with default data
 * Database schema should already be created via `npm run db:push`
 */
export async function POST() {
  try {
    await Database.seedDefaultData()
    return NextResponse.json({
      status: 'ok',
      message: 'Database seeded with default data',
    })
  } catch (error) {
    console.error('Setup failed:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Setup failed',
      },
      { status: 500 }
    )
  }
}
