import { getAdapter } from '../dbal-client'
import type { PowerTransferRequest } from '../../types/level-types'

/**
 * Add a new power transfer request
 */
export async function addPowerTransferRequest(request: PowerTransferRequest): Promise<void> {
  const adapter = getAdapter()
  await adapter.create('PowerTransferRequest', {
    id: request.id,
    fromUserId: request.fromUserId,
    toUserId: request.toUserId,
    status: request.status,
    createdAt: BigInt(request.createdAt),
    expiresAt: BigInt(request.expiresAt),
  })
}
