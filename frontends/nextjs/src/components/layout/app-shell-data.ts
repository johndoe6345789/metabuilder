import type { PackageNavItem } from '@/lib/packages/navigation'
import { packageMetadataToNavItem } from '@/lib/packages/navigation'
import { BASE_PATH } from '@/lib/app-config'
import { readList } from '@/lib/db/read-list'

const DBAL_PROXY_URL = `${BASE_PATH}/api/dbal`

type PackageRecord = {
  packageId: string
  name: string
  navLabel?: string
  icon?: string
  level?: number
  category?: string
  showInNav?: boolean
}

export const LEVEL_PACKAGES: Record<number, string[]> = {
  0: ['global'],
  1: ['global'],
  2: ['global', 'ui_level2'],
  3: ['global', 'ui_level2'],
  4: ['global', 'ui_level4'],
  5: ['global', 'ui_level4'],
}

export async function fetchDbalHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${DBAL_PROXY_URL}/health`, {
      signal: AbortSignal.timeout(3000),
    })
    return !res.ok
  } catch {
    return true
  }
}

export async function fetchNavigablePackages(): Promise<PackageNavItem[]> {
  try {
    const res = await fetch(`${DBAL_PROXY_URL}/system/core/InstalledPackage`, {
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return []

    // The proxy forwards DBAL's own envelope untouched -- {data: {data:
    // [...]}} -- so reading json.data directly is reading the inner
    // envelope object, not the row array, and always fails the
    // Array.isArray check below. readList unwraps whichever shape DBAL
    // actually sends.
    const rows = readList<Record<string, unknown>>(await res.json())

    return rows
      .filter(isPackageRecord)
      .map(pkg => packageMetadataToNavItem(pkg))
      .filter(pkg => pkg.showInNav)
  } catch {
    return []
  }
}

function isPackageRecord(pkg: Record<string, unknown>): pkg is PackageRecord {
  return typeof pkg.packageId === 'string' && typeof pkg.name === 'string'
}
