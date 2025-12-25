import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DBALClient } from '../../src/core/client'
import { DBALError, DBALErrorCode } from '../../src/core/errors'

const mockAdapter = vi.hoisted(() => ({
  create: vi.fn(),
  read: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  list: vi.fn(),
  findFirst: vi.fn(),
  findByField: vi.fn(),
  upsert: vi.fn(),
  updateByField: vi.fn(),
  deleteByField: vi.fn(),
  deleteMany: vi.fn(),
  createMany: vi.fn(),
  getCapabilities: vi.fn(),
  close: vi.fn(),
}))

vi.mock('../../src/adapters/prisma-adapter', () => ({
  PrismaAdapter: vi.fn(() => mockAdapter),
}))

const baseConfig = {
  mode: 'development' as const,
  adapter: 'prisma' as const,
  database: { url: 'file:memory' },
}

const workflowInput = {
  name: 'daily-sync',
  description: 'Sync at midnight',
  trigger: 'schedule' as const,
  triggerConfig: { cron: '0 0 * * *' },
  steps: { steps: [{ id: 'step-1', action: 'noop' }] },
  isActive: true,
  createdBy: '11111111-1111-1111-1111-111111111111',
}

const workflowRecord = {
  ...workflowInput,
  id: '22222222-2222-2222-2222-222222222222',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-02T00:00:00.000Z'),
}

beforeEach(() => {
  Object.values(mockAdapter).forEach(value => {
    if (typeof value === 'function' && 'mockReset' in value) {
      value.mockReset()
    }
  })
})

describe('DBALClient workflows', () => {
  it('creates workflows via adapter', async () => {
    mockAdapter.create.mockResolvedValue(workflowRecord)

    const client = new DBALClient(baseConfig)
    const result = await client.workflows.create(workflowInput)

    expect(mockAdapter.create).toHaveBeenCalledWith('Workflow', workflowInput)
    expect(result).toEqual(workflowRecord)
  })

  it('rejects invalid workflow data before adapter call', async () => {
    const client = new DBALClient(baseConfig)

    await expect(client.workflows.create({
      ...workflowInput,
      name: '',
    })).rejects.toMatchObject({ code: DBALErrorCode.VALIDATION_ERROR })

    expect(mockAdapter.create).not.toHaveBeenCalled()
  })

  it('maps workflow create conflicts to friendly message', async () => {
    mockAdapter.create.mockRejectedValue(DBALError.conflict('unique violation'))

    const client = new DBALClient(baseConfig)

    await expect(client.workflows.create(workflowInput)).rejects.toMatchObject({
      code: DBALErrorCode.CONFLICT,
      message: "Workflow with name 'daily-sync' already exists",
    })
  })

  it('throws not found when reading missing workflows', async () => {
    mockAdapter.read.mockResolvedValue(null)

    const client = new DBALClient(baseConfig)

    await expect(client.workflows.read(workflowRecord.id)).rejects.toMatchObject({
      code: DBALErrorCode.NOT_FOUND,
    })
  })

  it('updates, deletes, and lists workflows', async () => {
    const updatedRecord = { ...workflowRecord, name: 'updated-name' }
    mockAdapter.update.mockResolvedValue(updatedRecord)
    mockAdapter.delete.mockResolvedValue(true)
    mockAdapter.list.mockResolvedValue({
      data: [workflowRecord],
      total: 1,
      page: 1,
      limit: 20,
      hasMore: false,
    })

    const client = new DBALClient(baseConfig)

    const updateResult = await client.workflows.update(workflowRecord.id, { name: 'updated-name' })
    expect(updateResult).toEqual(updatedRecord)

    const deleteResult = await client.workflows.delete(workflowRecord.id)
    expect(deleteResult).toBe(true)

    const listResult = await client.workflows.list()
    expect(listResult.data).toEqual([workflowRecord])
    expect(mockAdapter.list).toHaveBeenCalledWith('Workflow', undefined)
  })
})
