import type { EntityOps } from '@/lib/db-client'
import type { DbalOperationResult } from './types'

export async function listOperation(
  ops: EntityOps,
  filter: Record<string, unknown>
): Promise<DbalOperationResult> {
  const result = await ops.list({ filter })
  return {
    success: true,
    data: result.data,
    meta: { count: result.data.length },
  }
}
