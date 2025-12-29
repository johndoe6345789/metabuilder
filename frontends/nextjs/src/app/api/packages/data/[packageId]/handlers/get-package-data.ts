import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getPackageData } from '@/lib/db/packages/get-package-data'

interface RouteParams {
  params: {
    packageId: string
  }
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const data = await getPackageData(params.packageId)
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching package data:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch package data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
