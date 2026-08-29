import { beforeEach, describe, expect, it, vi } from 'vitest'

const ops = vi.hoisted(() => ({
  list: vi.fn(),
  read: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}))
const entity = vi.hoisted(() => vi.fn(() => ops))

vi.mock('@/lib/db-client', () => ({ db: { entity } }))

import { executeDbalOperation } from './index'

const op = (operation: string, over: Record<string, unknown> = {}) => ({
  entity: 'Post',
  operation,
  ...over,
})

const tenant = { tenantId: 'acme' }

describe('executeDbalOperation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ops.list.mockResolvedValue({ data: [{ id: 'a' }] })
    ops.read.mockResolvedValue({ id: 'a' })
    ops.create.mockResolvedValue({ id: 'new' })
    ops.update.mockResolvedValue({ id: 'a' })
    ops.remove.mockResolvedValue(true)
  })

  describe('tenant scoping', () => {
    it('filters a list by the context tenant', async () => {
      await executeDbalOperation(op('list'), tenant)

      expect(ops.list).toHaveBeenCalledWith({ filter: { tenantId: 'acme' } })
    })

    it('reads the tenant from a nested tenant object too', async () => {
      await executeDbalOperation(op('list'), { tenant: { id: 'other' } })

      expect(ops.list).toHaveBeenCalledWith({ filter: { tenantId: 'other' } })
    })

    it('prefers an explicit tenantId over the nested one', async () => {
      await executeDbalOperation(op('list'), {
        tenantId: 'acme',
        tenant: { id: 'other' },
      })

      expect(ops.list).toHaveBeenCalledWith({ filter: { tenantId: 'acme' } })
    })

    it('sends no filter when there is no tenant at all', async () => {
      await executeDbalOperation(op('list'))

      expect(ops.list).toHaveBeenCalledWith({ filter: {} })
    })

    it('ignores an empty-string tenant rather than filtering on it', async () => {
      await executeDbalOperation(op('list'), { tenantId: '' })

      expect(ops.list).toHaveBeenCalledWith({ filter: {} })
    })

    it('stamps the tenant onto a created record', async () => {
      await executeDbalOperation(op('create'), { ...tenant, body: { a: 1 } })

      expect(ops.create).toHaveBeenCalledWith({ a: 1, tenantId: 'acme' })
    })

    it('overrides a body that names a different tenant', async () => {
      // Otherwise a caller could write into someone else's tenant.
      await executeDbalOperation(op('create'), {
        ...tenant,
        body: { a: 1, tenantId: 'attacker' },
      })

      expect(ops.create).toHaveBeenCalledWith({ a: 1, tenantId: 'acme' })
    })
  })

  describe('list', () => {
    it('returns the rows and a count', async () => {
      const result = await executeDbalOperation(op('list'), tenant)

      expect(result).toEqual({
        success: true,
        data: [{ id: 'a' }],
        meta: { count: 1 },
      })
    })
  })

  describe('read', () => {
    it('returns the record', async () => {
      const result = await executeDbalOperation(op('read', { id: 'a' }), tenant)

      expect(result).toEqual({ success: true, data: { id: 'a' } })
    })

    it.each([[undefined], ['']])('refuses id %p', async id => {
      const result = await executeDbalOperation(op('read', { id }), tenant)

      expect(result.success).toBe(false)
      expect(result.error).toContain('ID required')
      expect(ops.read).not.toHaveBeenCalled()
    })

    it('reports a missing record', async () => {
      ops.read.mockResolvedValue(null)

      const result = await executeDbalOperation(op('read', { id: 'x' }), tenant)

      expect(result).toEqual({ success: false, error: 'Record not found' })
    })
  })

  describe('create', () => {
    it.each([[undefined], ['a string'], [42], [[1, 2]], [null]])(
      'refuses a body of %p',
      async body => {
        const result = await executeDbalOperation(op('create'), {
          ...tenant,
          body,
        })

        expect(result.success).toBe(false)
        expect(ops.create).not.toHaveBeenCalled()
      }
    )
  })

  describe('update', () => {
    it('checks the record exists in this tenant before writing', async () => {
      // Without the read, a tenant could update a row it cannot see.
      await executeDbalOperation(op('update', { id: 'a' }), {
        ...tenant,
        body: { a: 1 },
      })

      expect(ops.read).toHaveBeenCalledWith('a')
      expect(ops.update).toHaveBeenCalledWith('a', { a: 1, tenantId: 'acme' })
    })

    it('refuses when that check finds nothing', async () => {
      ops.read.mockResolvedValue(null)

      const result = await executeDbalOperation(op('update', { id: 'a' }), {
        ...tenant,
        body: { a: 1 },
      })

      expect(result).toEqual({ success: false, error: 'Record not found' })
      expect(ops.update).not.toHaveBeenCalled()
    })

    it('skips the existence check when there is no tenant', async () => {
      await executeDbalOperation(op('update', { id: 'a' }), { body: { a: 1 } })

      expect(ops.read).not.toHaveBeenCalled()
      expect(ops.update).toHaveBeenCalled()
    })

    it('refuses a non-object body', async () => {
      const result = await executeDbalOperation(op('update', { id: 'a' }), {
        ...tenant,
        body: 'nope',
      })

      expect(result.success).toBe(false)
      expect(ops.update).not.toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    it('checks the record exists in this tenant first', async () => {
      await executeDbalOperation(op('delete', { id: 'a' }), tenant)

      expect(ops.read).toHaveBeenCalledWith('a')
      expect(ops.remove).toHaveBeenCalledWith('a')
    })

    it('refuses when the record is not in this tenant', async () => {
      ops.read.mockResolvedValue(null)

      const result = await executeDbalOperation(op('delete', { id: 'a' }), tenant)

      expect(result.success).toBe(false)
      expect(ops.remove).not.toHaveBeenCalled()
    })

    it('reports a delete the layer refused', async () => {
      ops.remove.mockResolvedValue(false)

      const result = await executeDbalOperation(op('delete', { id: 'a' }), tenant)

      expect(result).toEqual({ success: false, error: 'Record not found' })
    })

    it('confirms what it deleted', async () => {
      const result = await executeDbalOperation(op('delete', { id: 'a' }), tenant)

      expect(result).toEqual({ success: true, data: { deleted: 'a' } })
    })
  })

  describe('unknown operations', () => {
    it('names the operation it does not know', async () => {
      const result = await executeDbalOperation(op('truncate'), tenant)

      expect(result.error).toBe('Unknown operation: truncate')
    })
  })

  describe('when the data layer throws', () => {
    it('reports the message rather than propagating', async () => {
      ops.list.mockRejectedValue(new Error('connection lost'))

      const result = await executeDbalOperation(op('list'), tenant)

      expect(result).toEqual({ success: false, error: 'connection lost' })
    })

    it('handles a non-Error rejection', async () => {
      ops.list.mockRejectedValue('nope')

      const result = await executeDbalOperation(op('list'), tenant)

      expect(result.error).toBe('Operation failed')
    })
  })
})
