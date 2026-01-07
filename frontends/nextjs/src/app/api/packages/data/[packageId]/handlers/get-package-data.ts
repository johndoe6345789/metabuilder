import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getPackageData } from '@/lib/db/packages/get-package-data'
import { getSessionUser, STATUS } from '@/lib/routing'
import { PackageSchemas } from '@/lib/validation'

interface RouteParams {
  params: {
    packageId: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Validate packageId format
    const packageIdResult = PackageSchemas.packageId.safeParse(params.packageId)
    if (!packageIdResult.success) {
      return NextResponse.json(
        { error: 'Invalid package ID format' },
        { status: 400 }
      )
    }
    
    // Require authentication for package data access
    const session = await getSessionUser(request)
    
    if (session.user === null) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: STATUS.UNAUTHORIZED }
      )
    }
    
    const data = await getPackageData(params.packageId)
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching package data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch package data' },
      { status: 500 }
    )
  }
}
