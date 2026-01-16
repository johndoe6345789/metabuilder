import { NextResponse } from 'next/server'
import { getDBALClient, seedDatabase } from '@/dbal'

/**
 * POST /api/setup
 * One-time setup endpoint to seed database with default data
 * Database schema should already be created via `npm run db:push`
 * 
 * Uses DBAL seed system which loads data from:
 * - /dbal/shared/seeds/database/*.yaml - Base system data
 * - /packages/*/page-config/*.json - Package-specific routes
 */
export async function POST() {
  try {
    const dbal = getDBALClient()
    await seedDatabase(dbal)
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
