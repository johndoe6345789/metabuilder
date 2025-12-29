/**
 * @file delete-user.ts
 * @description DELETE handler for removing a user
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { requireDBALApiKey } from '@/lib/api/require-dbal-api-key'
import { dbalDeleteUser, initializeDBAL } from '@/lib/dbal/core/client/database-dbal.server'

interface RouteParams {
  params: {
    userId: string
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const unauthorized = requireDBALApiKey(request)
  if (unauthorized) {
    return unauthorized
  }
  try {
    await initializeDBAL()
    const success = await dbalDeleteUser(params.userId)

    if (!success) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user via DBAL:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
