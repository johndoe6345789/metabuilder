import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { deletePackageData } from '@/lib/db/packages/delete-package-data'

interface RouteParams {
  params: {
    packageId: string
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await deletePackageData(params.packageId)
    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('Error deleting package data:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete package data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
