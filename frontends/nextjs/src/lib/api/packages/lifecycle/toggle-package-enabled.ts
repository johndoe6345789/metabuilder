import { requestJson } from '@/lib/api/request-json'
import type { InstalledPackage } from '@/lib/package-types'

export async function togglePackageEnabled(
  packageId: string,
  enabled: boolean
): Promise<InstalledPackage> {
  const payload = await requestJson<{ installed: InstalledPackage }>(
    `/api/packages/installed/${packageId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    }
  )
  return payload.installed
}
