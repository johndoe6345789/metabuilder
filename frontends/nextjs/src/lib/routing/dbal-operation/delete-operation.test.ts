import { describe, expect, it, vi } from 'vitest'

import { deleteOperation } from './delete-operation'
import type { EntityOps } from '@/lib/db-client'

describe('deleteOperation', () => {
  it('requires an id', async () => {
    const ops = {} as EntityOps
    expect(await deleteOperation(ops, undefined, undefined)).toEqual({
      success: false,
      error: 'ID required for delete operation',
    })
  })

  it('reports not found when scoped to a tenant with no such record', async () => {
    const ops = { read: vi.fn(async () => null) } as unknown as EntityOps
    expect(await deleteOperation(ops, 'x', 't1')).toEqual({
      success: false,
      error: 'Record not found',
    })
  })

  it('reports not found when remove() itself reports failure', async () => {
    const ops = {
      remove: vi.fn(async () => false),
    } as unknown as EntityOps
    expect(await deleteOperation(ops, 'x', undefined)).toEqual({
      success: false,
      error: 'Record not found',
    })
  })

  it('deletes successfully', async () => {
    const ops = { remove: vi.fn(async () => true) } as unknown as EntityOps
    expect(await deleteOperation(ops, 'x', undefined)).toEqual({
      success: true,
      data: { deleted: 'x' },
    })
  })
})
