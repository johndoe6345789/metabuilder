import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { readJson } from '@/lib/api/read-json'
import { db } from '@/lib/db-client'
import type { PackageSeedData } from '@/lib/package-types'
import { getSessionUser, STATUS } from '@/lib/routing'
import { getRoleLevel, ROLE_LEVELS } from '@/lib/constants'
import { PackageSchemas } from '@/lib/validation'

type PackageDataPayload = {
  data?: PackageSeedData
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ packageId: string }> }
) {
  try {
    const resolvedParams = await params
    // Validate packageId format
    const packageIdResult = PackageSchemas.packageId.safeParse(resolvedParams.packageId)
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

    // Save package data using DBAL
    const dataJson = JSON.stringify(body.data)
    
    // Try update first, create if not found
    const ops = db.entity('PackageData')
    const existing = await ops.list({ filter: { packageId: resolvedParams.packageId } })
    if (existing.data.length > 0 && existing.data[0]?.id) {
      await ops.update(existing.data[0].id as string, { data: dataJson })
    } else {
      await ops.create({ packageId: resolvedParams.packageId, data: dataJson })
    }
    
    return NextResponse.json({ saved: true })
  } catch (error) {
    console.error('Error saving package data:', error)
    return NextResponse.json(
      { error: 'Failed to save package data' },
      { status: 500 }
    )
  }
}
