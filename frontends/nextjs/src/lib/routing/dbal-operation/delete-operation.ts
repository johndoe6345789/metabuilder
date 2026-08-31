import type { EntityOps } from '@/lib/db-client'
import type { DbalOperationResult } from './types'

export async function deleteOperation(
  ops: EntityOps,
  id: string | undefined,
  tenantId: string | undefined
): Promise<DbalOperationResult> {
  if (id === undefined || id.length === 0) {
    return { success: false, error: 'ID required for delete operation' }
  }
  if (tenantId !== undefined) {
    const existing = await ops.read(id)
    if (existing === null) return { success: false, error: 'Record not found' }
  }
  const deleted = await ops.remove(id)
  if (!deleted) return { success: false, error: 'Record not found' }
  return { success: true, data: { deleted: id } }
}
