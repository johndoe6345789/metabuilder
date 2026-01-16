import { getAdapter } from '../../core/dbal-client'
import type { PowerTransferRequest } from '@/lib/types/level-types'

/**
 * Add a power transfer request
 */
export async function addPowerTransferRequest(request: PowerTransferRequest): Promise<void> {
  const adapter = getAdapter()
  await adapter.create('PowerTransferRequest', {
    id: request.id,
    fromUserId: request.fromUserId,
    toUserId: request.toUserId,
    status: request.status,
    createdAt: request.createdAt,
    expiresAt: request.expiresAt,
  })
}
