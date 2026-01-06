import { getAdapter } from '../../core/dbal-client'
import type { PowerTransferRequest } from '@/lib/types/level-types'

type DBALPowerTransferRecord = {
  id: string
  fromUserId: string
  toUserId: string
  status: string
  createdAt: string | bigint
  expiresAt: string | bigint
}

/**
 * Get all power transfer requests
 */
export async function getPowerTransferRequests(): Promise<PowerTransferRequest[]> {
  const adapter = getAdapter()
  const result = (await adapter.list('PowerTransferRequest')) as { data: DBALPowerTransferRecord[] }
  return result.data.map(request => ({
    id: request.id,
    fromUserId: request.fromUserId,
    toUserId: request.toUserId,
    status: request.status,
    createdAt: typeof request.createdAt === 'bigint' ? request.createdAt : BigInt(request.createdAt),
    expiresAt: typeof request.expiresAt === 'bigint' ? request.expiresAt : BigInt(request.expiresAt),
  }))
}
