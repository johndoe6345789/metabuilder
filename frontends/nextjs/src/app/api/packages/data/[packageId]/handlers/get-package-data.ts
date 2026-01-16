import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { db } from '@/lib/db-client'
import { getSessionUser, STATUS } from '@/lib/routing'
import { PackageSchemas } from '@/lib/validation'

export async function GET(
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
    
    // Require authentication for package data access
    const session = await getSessionUser(request)
    
    if (session.user === null) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: STATUS.UNAUTHORIZED }
      )
    }
    
    // Get package data using DBAL
    const packageData = await db.packageData.read(resolvedParams.packageId)
    
    if (!packageData) {
      return NextResponse.json({ data: null })
    }
    
    // Parse the JSON data field
    const data = packageData.data ? JSON.parse(packageData.data) : null
    
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching package data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch package data' },
      { status: 500 }
    )
  }
}
