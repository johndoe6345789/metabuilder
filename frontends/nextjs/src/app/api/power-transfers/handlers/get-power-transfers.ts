import { NextResponse } from 'next/server'
import { getPowerTransferRequests } from '@/lib/db/power-transfers'

export async function GET() {
  try {
    const requests = await getPowerTransferRequests()
    const sorted = [...requests].sort((a, b) => b.createdAt - a.createdAt)
    return NextResponse.json({ requests: sorted })
  } catch (error) {
    console.error('Error fetching power transfer requests:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch power transfer requests',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
