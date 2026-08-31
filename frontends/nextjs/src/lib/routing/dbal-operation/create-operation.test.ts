import { describe, expect, it, vi } from 'vitest'

import { createOperation } from './create-operation'
import type { EntityOps } from '@/lib/db-client'

describe('createOperation', () => {
  it('requires a plain-object body', async () => {
    const ops = {} as EntityOps
    expect(await createOperation(ops, 'nope', undefined)).toEqual({
      success: false,
      error: 'Body required for create operation',
    })
  })

  it('stamps the tenantId onto the created record', async () => {
    const create = vi.fn(async (data: Record<string, unknown>) => data)
    const ops = { create } as unknown as EntityOps
    const result = await createOperation(ops, { name: 'x' }, 't1')
    expect(create).toHaveBeenCalledWith({ name: 'x', tenantId: 't1' })
    expect(result).toEqual({ success: true, data: { name: 'x', tenantId: 't1' } })
  })

  it('omits tenantId when none is resolved', async () => {
    const create = vi.fn(async (data: Record<string, unknown>) => data)
    const ops = { create } as unknown as EntityOps
    await createOperation(ops, { name: 'x' }, undefined)
    expect(create).toHaveBeenCalledWith({ name: 'x' })
  })
})
