import { getAdapter } from '../../core/dbal-client'
import type { PowerTransferRequest } from '@/lib/types/level-types'

type DBALPowerTransferRecord = {
  id: string
}

/**
 * Set all power transfer requests (replaces existing)
 */
export async function setPowerTransferRequests(requests: PowerTransferRequest[]): Promise<void> {
  const adapter = getAdapter()

  // Delete existing requests
  const existing = (await adapter.list('PowerTransferRequest')) as { data: DBALPowerTransferRecord[] }
  for (const request of existing.data) {
    await adapter.delete('PowerTransferRequest', request.id)
  }

  // Create new requests
  for (const request of requests) {
    await adapter.create('PowerTransferRequest', {
      id: request.id,
      fromUserId: request.fromUserId,
      toUserId: request.toUserId,
      status: request.status,
      createdAt: request.createdAt,
      expiresAt: request.expiresAt,
    })
  }
}
