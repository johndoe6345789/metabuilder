import { getAdapter } from '../../core/dbal-client'

/**
 * Update an error log entry (typically to mark as resolved)
 */
export async function updateErrorLog(
  id: string,
  updates: {
    resolved?: boolean
    resolvedAt?: number
    resolvedBy?: string
  }
): Promise<void> {
  const adapter = getAdapter()

  const data: Record<string, any> = {}
  if (updates.resolved !== undefined) data.resolved = updates.resolved
  if (updates.resolvedAt !== undefined) data.resolvedAt = BigInt(updates.resolvedAt)
  if (updates.resolvedBy !== undefined) data.resolvedBy = updates.resolvedBy

  await adapter.update('ErrorLog', id, data)
}
