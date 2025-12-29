import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { deletePowerTransferRequest } from '@/lib/db/power-transfers'

interface RouteParams {
  params: {
    requestId: string
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await deletePowerTransferRequest(params.requestId)
    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('Error deleting power transfer request:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete power transfer request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
