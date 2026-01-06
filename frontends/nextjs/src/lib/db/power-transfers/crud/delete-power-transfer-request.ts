import { getAdapter } from '../../core/dbal-client'

/**
 * Delete a power transfer request by ID
 */
export async function deletePowerTransferRequest(requestId: string): Promise<void> {
  const adapter = getAdapter()
  await adapter.delete('PowerTransferRequest', requestId)
}
