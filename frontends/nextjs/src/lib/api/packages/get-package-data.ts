import { requestJson } from '@/lib/api/request-json'

export async function getPackageData(packageId: string): Promise<Record<string, any[]>> {
  const payload = await requestJson<{ data: Record<string, any[]> }>(`/api/packages/data/${packageId}`)
  return payload.data
}
