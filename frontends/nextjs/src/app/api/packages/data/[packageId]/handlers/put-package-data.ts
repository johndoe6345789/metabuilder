import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { readJson } from '@/lib/api/read-json'
import { setPackageData } from '@/lib/db/packages/set-package-data'
import type { PackageSeedData } from '@/lib/package-types'
import { getSessionUser, STATUS } from '@/lib/routing'
import { getRoleLevel, ROLE_LEVELS } from '@/lib/constants'
import { PackageSchemas } from '@/lib/validation'

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
    // Validate packageId format
    const packageIdResult = PackageSchemas.packageId.safeParse(params.packageId)
    if (!packageIdResult.success) {
      return NextResponse.json(
        { error: 'Invalid package ID format' },
        { status: 400 }
      )
    }
    
    // Require authentication for package data modification
    const session = await getSessionUser(request)
    
    if (session.user === null) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: STATUS.UNAUTHORIZED }
      )
    }
    
    // Require admin level or higher for package data modification
    const userRole = (session.user as { role?: string }).role ?? 'public'
    const userLevel = getRoleLevel(userRole)
    
    if (userLevel < ROLE_LEVELS.admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: STATUS.FORBIDDEN }
      )
    }
    
    const body = await readJson<PackageDataPayload>(request)
    if (body.data === undefined) {
      return NextResponse.json({ error: 'Package data is required' }, { status: 400 })
    }

    await setPackageData(params.packageId, body.data)
    return NextResponse.json({ saved: true })
  } catch (error) {
    console.error('Error saving package data:', error)
    return NextResponse.json(
      { error: 'Failed to save package data' },
      { status: 500 }
    )
  }
}
