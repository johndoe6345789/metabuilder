import type { EntityOps } from '@/lib/db-client'
import type { DbalOperationResult } from './types'

export async function readOperation(
  ops: EntityOps,
  id: string | undefined
): Promise<DbalOperationResult> {
  if (id === undefined || id.length === 0) {
    return { success: false, error: 'ID required for read operation' }
  }
  const record = await ops.read(id)
  if (record === null) return { success: false, error: 'Record not found' }
  return { success: true, data: record }
}
