import type { EntityOps } from '@/lib/db-client'
import { isPlainObject } from '../is-plain-object'
import type { DbalOperationResult } from './types'

export async function createOperation(
  ops: EntityOps,
  body: unknown,
  tenantId: string | undefined
): Promise<DbalOperationResult> {
  if (!isPlainObject(body)) {
    return { success: false, error: 'Body required for create operation' }
  }
  const data = { ...body, ...(tenantId !== undefined ? { tenantId } : {}) }
  const created = await ops.create(data)
  return { success: true, data: created }
}
