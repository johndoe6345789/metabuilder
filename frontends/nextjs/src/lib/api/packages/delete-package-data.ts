import { requestJson } from '@/lib/api/request-json'

export async function deletePackageData(packageId: string): Promise<void> {
  await requestJson<{ deleted: boolean }>(`/api/packages/data/${packageId}`, {
    method: 'DELETE',
  })
}
