import { requestJson } from '@/lib/api/request-json'

export async function setPackageData(packageId: string, data: Record<string, any[]>): Promise<void> {
  await requestJson<{ saved: boolean }>(`/api/packages/data/${packageId}`, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  })
}
