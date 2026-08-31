import type { EntityOps } from '@/lib/db-client'
import { isPlainObject } from '../is-plain-object'
import type { DbalOperationResult } from './types'

export async function updateOperation(
  ops: EntityOps,
  id: string | undefined,
  body: unknown,
  tenantId: string | undefined
): Promise<DbalOperationResult> {
  if (id === undefined || id.length === 0) {
    return { success: false, error: 'ID required for update operation' }
  }
  if (!isPlainObject(body)) {
    return { success: false, error: 'Body required for update operation' }
  }
  if (tenantId !== undefined) {
    const existing = await ops.read(id)
    if (existing === null) return { success: false, error: 'Record not found' }
  }
  const data = { ...body, ...(tenantId !== undefined ? { tenantId } : {}) }
  const updated = await ops.update(id, data)
  return { success: true, data: updated }
}
