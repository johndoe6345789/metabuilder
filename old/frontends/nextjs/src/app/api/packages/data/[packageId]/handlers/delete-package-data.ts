import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { deletePackageData } from '@/lib/db/packages/delete-package-data'
import { getSessionUser, STATUS } from '@/lib/routing'
import { getRoleLevel, ROLE_LEVELS } from '@/lib/constants'
import { PackageSchemas } from '@/lib/validation'

interface RouteParams {
  params: {
    packageId: string
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Validate packageId format
    const packageIdResult = PackageSchemas.packageId.safeParse(params.packageId)
    if (!packageIdResult.success) {
      return NextResponse.json(
        { error: 'Invalid package ID format' },
        { status: 400 }
      )
    }
    
    // Require authentication for package data deletion
    const session = await getSessionUser(request)
    
    if (session.user === null) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: STATUS.UNAUTHORIZED }
      )
    }
    
    // Require admin level or higher for package data deletion
    const userRole = (session.user as { role?: string }).role ?? 'public'
    const userLevel = getRoleLevel(userRole)
    
    if (userLevel < ROLE_LEVELS.admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: STATUS.FORBIDDEN }
      )
    }
    
    await deletePackageData(params.packageId)
    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('Error deleting package data:', error)
    return NextResponse.json(
      { error: 'Failed to delete package data' },
      { status: 500 }
    )
  }
}
