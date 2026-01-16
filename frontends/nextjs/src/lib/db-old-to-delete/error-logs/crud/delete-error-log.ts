import { getAdapter } from '../../core/dbal-client'

/**
 * Delete an error log entry
 */
export async function deleteErrorLog(id: string): Promise<void> {
  const adapter = getAdapter()
  await adapter.delete('ErrorLog', id)
}
