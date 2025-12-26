import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { readJson } from '@/lib/api/read-json'
import { Database } from '@/lib/database'
import {
  addPowerTransferRequest,
  getPowerTransferRequests,
  updatePowerTransferRequest,
} from '@/lib/db/power-transfers'

const REQUEST_EXPIRY_MS = 60 * 60 * 1000

interface CreatePowerTransferPayload {
  fromUserId?: string
  toUserId?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await readJson<CreatePowerTransferPayload>(request)
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    const fromUserId = body.fromUserId?.trim()
    const toUserId = body.toUserId?.trim()

    if (!fromUserId || !toUserId) {
      return NextResponse.json({ error: 'Both fromUserId and toUserId are required' }, { status: 400 })
    }

    if (fromUserId === toUserId) {
      return NextResponse.json({ error: 'Cannot transfer power to the same user' }, { status: 400 })
    }

    const fromUser = await Database.getUserById(fromUserId)
    if (!fromUser || fromUser.role !== 'supergod') {
      return NextResponse.json({ error: 'Only an active supergod can initiate transfers' }, { status: 403 })
    }

    const toUser = await Database.getUserById(toUserId)
    if (!toUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
    }

    if (toUser.role === 'supergod') {
      return NextResponse.json({ error: 'Target user already has supergod privileges' }, { status: 409 })
    }

    const pendingRequests = await getPowerTransferRequests()
    if (pendingRequests.some((request) => request.status === 'pending' && request.toUserId === toUserId)) {
      return NextResponse.json(
        { error: 'There is already a pending transfer request for that user' },
        { status: 409 }
      )
    }

    const now = Date.now()
    const requestId = `power_transfer_${randomUUID()}`
    const newRequest = {
      id: requestId,
      fromUserId,
      toUserId,
      status: 'pending' as const,
      createdAt: now,
      expiresAt: now + REQUEST_EXPIRY_MS,
    }

    await addPowerTransferRequest(newRequest)

    try {
      await Database.transferSuperGodPower(fromUserId, toUserId)
      await updatePowerTransferRequest(requestId, { status: 'accepted' })

      return NextResponse.json(
        {
          request: {
            ...newRequest,
            status: 'accepted',
          },
        },
        { status: 201 }
      )
    } catch (error) {
      await updatePowerTransferRequest(requestId, { status: 'rejected' })
      throw error
    }
  } catch (error) {
    console.error('Error creating power transfer request:', error)
    return NextResponse.json(
      {
        error: 'Failed to process power transfer request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
