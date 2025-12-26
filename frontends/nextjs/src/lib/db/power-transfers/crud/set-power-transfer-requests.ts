import { getAdapter } from '../../core/dbal-client'
import type { PowerTransferRequest } from '../../types/level-types'

/**
 * Set all power transfer requests (replaces existing)
 */
export async function setPowerTransferRequests(requests: PowerTransferRequest[]): Promise<void> {
  const adapter = getAdapter()
  // Delete all existing
  const existing = await adapter.list('PowerTransferRequest')
  for (const item of existing.data as any[]) {
    await adapter.delete('PowerTransferRequest', item.id)
  }
  // Create new ones
  for (const request of requests) {
    await adapter.create('PowerTransferRequest', {
      id: request.id,
      fromUserId: request.fromUserId,
      toUserId: request.toUserId,
      status: request.status,
      createdAt: BigInt(request.createdAt),
      expiresAt: BigInt(request.expiresAt),
    })
  }
}
