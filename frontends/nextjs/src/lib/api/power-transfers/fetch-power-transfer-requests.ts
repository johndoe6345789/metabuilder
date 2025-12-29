import { requestJson } from '@/lib/api/request-json'
import type { PowerTransferRequest } from '@/lib/level-types'

export async function fetchPowerTransferRequests(): Promise<PowerTransferRequest[]> {
  const payload = await requestJson<{ requests: PowerTransferRequest[] }>('/api/power-transfers')
  return payload.requests
}
