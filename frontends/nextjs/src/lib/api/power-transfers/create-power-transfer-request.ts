import type { PowerTransferRequest } from '@/lib/level-types'
import { requestJson } from '@/lib/api/request-json'

interface CreatePowerTransferRequestPayload {
  fromUserId: string
  toUserId: string
}

export async function createPowerTransferRequest(
  payload: CreatePowerTransferRequestPayload
): Promise<PowerTransferRequest> {
  const response = await requestJson<{ request: PowerTransferRequest }>('/api/power-transfers', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.request
}
