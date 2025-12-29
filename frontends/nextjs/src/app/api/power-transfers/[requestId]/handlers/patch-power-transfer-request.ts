import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { readJson } from '@/lib/api/read-json'
import { updatePowerTransferRequest } from '@/lib/db/power-transfers'
import type { PowerTransferRequest } from '@/lib/level-types'

type UpdatePayload = {
  status?: PowerTransferRequest['status']
}

const STATUS_VALUES: PowerTransferRequest['status'][] = ['pending', 'accepted', 'rejected']

interface RouteParams {
  params: {
    requestId: string
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await readJson<UpdatePayload>(request)
    if (!body || !body.status) {
      return NextResponse.json({ error: 'Status value is required' }, { status: 400 })
    }

    if (!STATUS_VALUES.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }

    await updatePowerTransferRequest(params.requestId, { status: body.status })

    return NextResponse.json({ updated: true, status: body.status })
  } catch (error) {
    console.error('Error updating power transfer request:', error)
    return NextResponse.json(
      {
        error: 'Failed to update power transfer request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
