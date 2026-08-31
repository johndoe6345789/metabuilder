import { describe, expect, it, vi } from 'vitest'

import { updateOperation } from './update-operation'
import type { EntityOps } from '@/lib/db-client'

describe('updateOperation', () => {
  it('requires an id', async () => {
    const ops = {} as EntityOps
    expect(await updateOperation(ops, undefined, {}, undefined)).toEqual({
      success: false,
      error: 'ID required for update operation',
    })
  })

  it('requires a plain-object body', async () => {
    const ops = {} as EntityOps
    expect(await updateOperation(ops, 'x', 'nope', undefined)).toEqual({
      success: false,
      error: 'Body required for update operation',
    })
  })

  it('reports not found when scoped to a tenant that has no such record', async () => {
    const ops = { read: vi.fn(async () => null) } as unknown as EntityOps
    expect(await updateOperation(ops, 'x', {}, 't1')).toEqual({
      success: false,
      error: 'Record not found',
    })
  })

  it('skips the existence check with no tenant scope', async () => {
    const read = vi.fn()
    const update = vi.fn(async (_id, data) => data)
    const ops = { read, update } as unknown as EntityOps
    await updateOperation(ops, 'x', { name: 'y' }, undefined)
    expect(read).not.toHaveBeenCalled()
    expect(update).toHaveBeenCalledWith('x', { name: 'y' })
  })

  it('updates and stamps the tenantId', async () => {
    const ops = {
      read: vi.fn(async () => ({ id: 'x' })),
      update: vi.fn(async (_id, data) => data),
    } as unknown as EntityOps
    const result = await updateOperation(ops, 'x', { name: 'y' }, 't1')
    expect(result).toEqual({
      success: true,
      data: { name: 'y', tenantId: 't1' },
    })
  })
})
