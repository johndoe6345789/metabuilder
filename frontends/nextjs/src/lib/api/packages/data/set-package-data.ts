import { requestJson } from '@/lib/api/request-json'
import { type PackageSeedData } from '@/lib/packages/core/package-types'

export async function setPackageData(
  packageId: string,
  data: PackageSeedData
): Promise<void> {
  await requestJson<{ saved: boolean }>(`/api/packages/data/${packageId}`, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  })
}
