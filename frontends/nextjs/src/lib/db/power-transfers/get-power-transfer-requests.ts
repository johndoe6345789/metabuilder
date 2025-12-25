import { getAdapter } from '../dbal-client'
import type { PowerTransferRequest } from '../../types/level-types'

/**
 * Get all power transfer requests from database
 */
export async function getPowerTransferRequests(): Promise<PowerTransferRequest[]> {
  const adapter = getAdapter()
  const result = await adapter.list('PowerTransferRequest')
  return (result.data as any[]).map((r) => ({
    id: r.id,
    fromUserId: r.fromUserId,
    toUserId: r.toUserId,
    status: r.status as any,
    createdAt: Number(r.createdAt),
    expiresAt: Number(r.expiresAt),
  }))
}
