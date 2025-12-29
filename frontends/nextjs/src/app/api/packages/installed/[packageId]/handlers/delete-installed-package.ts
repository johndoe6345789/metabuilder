import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getInstalledPackages } from '@/lib/db/packages/get-installed-packages'
import { uninstallPackage } from '@/lib/db/packages/uninstall-package'
import { getPackageCatalogEntry } from '@/lib/packages/server/get-package-catalog-entry'
import { uninstallPackageContent } from '@/lib/packages/server/uninstall-package-content'

interface RouteParams {
  params: {
    packageId: string
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const entry = getPackageCatalogEntry(params.packageId)
    if (!entry) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    const installed = await getInstalledPackages()
    if (!installed.some(pkg => pkg.packageId === params.packageId)) {
      return NextResponse.json({ error: 'Package not installed' }, { status: 404 })
    }

    await uninstallPackageContent(params.packageId, entry.content)
    await uninstallPackage(params.packageId)

    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('Error uninstalling package:', error)
    return NextResponse.json(
      {
        error: 'Failed to uninstall package',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
