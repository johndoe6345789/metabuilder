/**
 * @file patch-user.ts
 * @description PATCH handler for updating a user
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  dbalUpdateUser,
  initializeDBAL,
} from '@/lib/dbal/core/client/database-dbal.server'
import { hashPassword } from '@/lib/db/hash-password'
import { setCredential } from '@/lib/db/credentials/set-credential'
import { requireDBALApiKey } from '@/lib/api/require-dbal-api-key'
import { normalizeRole, readJson } from '../utils/request-helpers'

interface RouteParams {
  params: {
    userId: string
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const unauthorized = requireDBALApiKey(request)
  if (unauthorized) {
    return unauthorized
  }
  try {
    await initializeDBAL()

    const body = await readJson<{
      username?: string
      email?: string
      role?: string
      password?: string
      profilePicture?: string
      bio?: string
      tenantId?: string
      isInstanceOwner?: boolean
    }>(request)

    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    const { password, role, ...updateFields } = body
    const normalizedRole = normalizeRole(role)

    const updatedUser = await dbalUpdateUser(params.userId, {
      ...updateFields,
      ...(normalizedRole && { role: normalizedRole }),
    })

    if (password) {
      const hashedPassword = await hashPassword(password)
      await setCredential({
        username: updatedUser.username,
        passwordHash: hashedPassword,
        userId: updatedUser.id,
        firstLogin: false,
      })
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Error updating user via DBAL:', error)
    return NextResponse.json(
      {
        error: 'Failed to update user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
