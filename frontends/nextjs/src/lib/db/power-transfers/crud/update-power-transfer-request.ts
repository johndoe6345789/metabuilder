import { getAdapter } from '../../core/dbal-client'
import type { PowerTransferRequest } from '../../types/level-types'

/**
 * Update an existing power transfer request
 */
export async function updatePowerTransferRequest(
  requestId: string,
  updates: Partial<PowerTransferRequest>
): Promise<void> {
  const adapter = getAdapter()
  const data: Record<string, any> = {}
  if (updates.status !== undefined) data.status = updates.status
  await adapter.update('PowerTransferRequest', requestId, data)
}
