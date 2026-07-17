import type { PackageNavItem } from '@/lib/packages/navigation'
import { packageMetadataToNavItem } from '@/lib/packages/navigation'
import { BASE_PATH } from '@/lib/app-config'

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

    const json = (await res.json()) as {
      data?: Array<Record<string, unknown>>
    }

    if (!Array.isArray(json.data)) return []

    return json.data
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
