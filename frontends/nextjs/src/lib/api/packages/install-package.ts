import type { InstalledPackage } from '@/lib/package-types'
import { requestJson } from '@/lib/api/request-json'

export async function installPackage(packageId: string): Promise<InstalledPackage> {
  const payload = await requestJson<{ installed: InstalledPackage }>('/api/packages/installed', {
    method: 'POST',
    body: JSON.stringify({ packageId }),
  })
  return payload.installed
}
