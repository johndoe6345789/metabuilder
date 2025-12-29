import { requestJson } from '@/lib/api/request-json'
import type { InstalledPackage } from '@/lib/package-types'

export async function listInstalledPackages(): Promise<InstalledPackage[]> {
  const payload = await requestJson<{ installed: InstalledPackage[] }>('/api/packages/installed')
  return payload.installed
}
