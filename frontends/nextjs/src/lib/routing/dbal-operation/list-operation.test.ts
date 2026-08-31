import { describe, expect, it, vi } from 'vitest'

import { listOperation } from './list-operation'
import type { EntityOps } from '@/lib/db-client'

const ops = (data: unknown[]) =>
  ({ list: vi.fn(async () => ({ data })) }) as unknown as EntityOps

describe('listOperation', () => {
  it('returns the rows and a count', async () => {
    const result = await listOperation(ops([{ id: '1' }, { id: '2' }]), {})
    expect(result).toEqual({
      success: true,
      data: [{ id: '1' }, { id: '2' }],
      meta: { count: 2 },
    })
  })

  it('passes the filter through to the entity ops', async () => {
    const listFn = vi.fn(async () => ({ data: [] }))
    await listOperation({ list: listFn } as unknown as EntityOps, {
      tenantId: 't1',
    })
    expect(listFn).toHaveBeenCalledWith({ filter: { tenantId: 't1' } })
  })
})
