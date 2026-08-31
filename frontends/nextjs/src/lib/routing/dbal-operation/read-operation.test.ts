import { describe, expect, it, vi } from 'vitest'

import { readOperation } from './read-operation'
import type { EntityOps } from '@/lib/db-client'

describe('readOperation', () => {
  it('requires an id', async () => {
    const ops = {} as EntityOps
    expect(await readOperation(ops, undefined)).toEqual({
      success: false,
      error: 'ID required for read operation',
    })
    expect(await readOperation(ops, '')).toEqual({
      success: false,
      error: 'ID required for read operation',
    })
  })

  it('reports not found for a missing record', async () => {
    const ops = { read: vi.fn(async () => null) } as unknown as EntityOps
    expect(await readOperation(ops, 'x')).toEqual({
      success: false,
      error: 'Record not found',
    })
  })

  it('returns the record on success', async () => {
    const ops = {
      read: vi.fn(async () => ({ id: 'x' })),
    } as unknown as EntityOps
    expect(await readOperation(ops, 'x')).toEqual({
      success: true,
      data: { id: 'x' },
    })
  })
})
