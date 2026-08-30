import { describe, expect, it, vi } from 'vitest'

const client = vi.hoisted(() => ({
  db: { workflows: { list: vi.fn(), create: vi.fn() } },
}))
vi.mock('@/lib/db-client', () => client)

import { createWorkflow, listWorkflows } from './workflows-store'

describe('listWorkflows', () => {
  it('passes the filter, limit and offset straight through', async () => {
    client.db.workflows.list.mockResolvedValue({ data: [], total: 0 })
    await listWorkflows({ filter: { tenantId: 'acme' }, limit: 10, offset: 5 })
    expect(client.db.workflows.list).toHaveBeenCalledWith({
      filter: { tenantId: 'acme' },
      limit: 10,
      offset: 5,
    })
  })

  it('returns the rows and the total the data layer reports', async () => {
    client.db.workflows.list.mockResolvedValue({
      data: [{ id: 'w1' }],
      total: 9,
    })
    expect(
      await listWorkflows({ filter: {}, limit: 50, offset: 0 })
    ).toEqual({ items: [{ id: 'w1' }], total: 9 })
  })

  it('falls back to the row count when no total is reported', async () => {
    client.db.workflows.list.mockResolvedValue({
      data: [{ id: 'w1' }, { id: 'w2' }],
    })
    expect(
      (await listWorkflows({ filter: {}, limit: 50, offset: 0 })).total
    ).toBe(2)
  })
})

describe('createWorkflow', () => {
  it('writes the record and returns what the data layer saved', async () => {
    client.db.workflows.create.mockResolvedValue({ id: 'w1', name: 'Sync' })
    const record = { id: 'w1', name: 'Sync', tenantId: 'acme' }
    expect(await createWorkflow(record)).toEqual({ id: 'w1', name: 'Sync' })
    expect(client.db.workflows.create).toHaveBeenCalledWith(record)
  })
})
