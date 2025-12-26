import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { readJson } from '@/lib/api/read-json'
import { getInstalledPackages } from '@/lib/db/packages/get-installed-packages'
import { togglePackageEnabled } from '@/lib/db/packages/toggle-package-enabled'
import type { InstalledPackage } from '@/lib/package-types'

type UpdateInstalledPackagePayload = {
  enabled?: boolean
}

interface RouteParams {
  params: {
    packageId: string
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await readJson<UpdateInstalledPackagePayload>(request)
    if (!body || typeof body.enabled !== 'boolean') {
      return NextResponse.json({ error: 'Enabled flag is required' }, { status: 400 })
    }

    const installed = await getInstalledPackages()
    const existing = installed.find((pkg) => pkg.packageId === params.packageId)
    if (!existing) {
      return NextResponse.json({ error: 'Package not installed' }, { status: 404 })
    }

    await togglePackageEnabled(params.packageId, body.enabled)
    const updated: InstalledPackage = { ...existing, enabled: body.enabled }

    return NextResponse.json({ installed: updated })
  } catch (error) {
    console.error('Error updating installed package:', error)
    return NextResponse.json(
      {
        error: 'Failed to update installed package',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
