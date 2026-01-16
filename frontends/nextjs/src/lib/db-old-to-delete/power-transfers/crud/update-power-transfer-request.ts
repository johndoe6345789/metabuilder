import { getAdapter } from '../../core/dbal-client'
import type { PowerTransferRequest } from '@/lib/types/level-types'

/**
 * Update a power transfer request by ID
 */
export async function updatePowerTransferRequest(
  requestId: string,
  updates: Partial<PowerTransferRequest>
): Promise<void> {
  const adapter = getAdapter()
  const data: Record<string, unknown> = {}
  if (updates.status !== undefined) data.status = updates.status
  if (updates.expiresAt !== undefined) data.expiresAt = updates.expiresAt

  await adapter.update('PowerTransferRequest', requestId, data)
}
