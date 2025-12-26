import type { InstalledPackage } from '@/lib/package-types'
import { requestJson } from '@/lib/api/request-json'

export async function listInstalledPackages(): Promise<InstalledPackage[]> {
  const payload = await requestJson<{ installed: InstalledPackage[] }>('/api/packages/installed')
  return payload.installed
}
