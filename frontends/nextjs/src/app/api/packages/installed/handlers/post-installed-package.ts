import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { readJson } from '@/lib/api/read-json'
import { getInstalledPackages } from '@/lib/db/packages/get-installed-packages'
import { installPackage } from '@/lib/db/packages/install-package'
import type { InstalledPackage, PackageContent, PackageManifest } from '@/lib/package-types'
import { getPackageCatalogEntry } from '@/lib/packages/server/get-package-catalog-entry'
import { installPackageContent } from '@/lib/packages/server/install-package-content'

type InstallPackagePayload = {
  packageId?: string
  installedAt?: number
  enabled?: boolean
  version?: string
  manifest?: PackageManifest
  content?: PackageContent
}

export async function POST(request: NextRequest) {
  try {
    const body = await readJson<InstallPackagePayload>(request)
    if (!body) return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })

    const packageId = typeof body.packageId === 'string' ? body.packageId.trim() : (typeof body.manifest?.id === 'string' ? body.manifest.id : '')
    if (!packageId) return NextResponse.json({ error: 'Package ID is required' }, { status: 400 })

    const entry = getPackageCatalogEntry(packageId)
    const content = body.content ?? entry?.content
    if (!content) return NextResponse.json({ error: 'Package content not found' }, { status: 404 })

    const installed = await getInstalledPackages()
    if (installed.some((pkg) => pkg.packageId === packageId)) {
      return NextResponse.json({ error: 'Package already installed' }, { status: 409 })
    }

    await installPackageContent(packageId, content)

    const installedAt = typeof body.installedAt === 'number' ? body.installedAt : Date.now()
    const version = typeof body.version === 'string'
      ? body.version
      : (body.manifest?.version ?? entry?.manifest.version ?? '0.0.0')
    const enabled = typeof body.enabled === 'boolean' ? body.enabled : true
    const installedPackage: InstalledPackage = { packageId, installedAt, version, enabled }

    await installPackage(installedPackage)
    return NextResponse.json({ installed: installedPackage }, { status: 201 })
  } catch (error) {
    console.error('Error installing package:', error)
    return NextResponse.json(
      {
        error: 'Failed to install package',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
