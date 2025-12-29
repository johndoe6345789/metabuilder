/**
 * @file get-user.ts
 * @description GET handler for fetching a user by ID
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { dbalGetUserById, initializeDBAL } from '@/lib/dbal/core/client/database-dbal.server'
import { requireDBALApiKey } from '@/lib/api/require-dbal-api-key'

interface RouteParams {
  params: {
    userId: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const unauthorized = requireDBALApiKey(request)
  if (unauthorized) {
    return unauthorized
  }
  try {
    await initializeDBAL()
    const user = await dbalGetUserById(params.userId)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user via DBAL:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
