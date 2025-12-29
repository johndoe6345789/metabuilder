import { requestJson } from '@/lib/api/request-json'
import { type PackageSeedData } from '@/lib/packages/core/package-types'

export async function getPackageData(packageId: string): Promise<PackageSeedData> {
  const payload = await requestJson<{ data: PackageSeedData }>(
    `/api/packages/data/${packageId}`
  )
  return payload.data
}
