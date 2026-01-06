import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { readJson } from '@/lib/api/read-json'
import { setPackageData } from '@/lib/db/packages/set-package-data'
import type { PackageSeedData } from '@/lib/package-types'

type PackageDataPayload = {
  data?: PackageSeedData
}

interface RouteParams {
  params: {
    packageId: string
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await readJson<PackageDataPayload>(request)
    if (body?.data === null || body?.data === undefined || Array.isArray(body.data)) {
      return NextResponse.json({ error: 'Package data is required' }, { status: 400 })
    }

    await setPackageData(params.packageId, body.data)
    return NextResponse.json({ saved: true })
  } catch (error) {
    console.error('Error saving package data:', error)
    return NextResponse.json(
      {
        error: 'Failed to save package data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
