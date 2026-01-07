import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DBALClient } from '../../src/core/client'
import { DBALErrorCode } from '../../src/core/errors'

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
  updateMany: vi.fn(),
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
  tenantId: 'tenant-123',
}

const userBatch = [
  { username: 'alpha', email: 'alpha@example.com', role: 'user' as const },
  { username: 'beta', email: 'beta@example.com', role: 'admin' as const },
]

const packageBatch = [
  {
    name: 'forum',
    version: '1.0.0',
    author: 'MetaBuilder',
    manifest: { entry: 'index.lua' },
    isInstalled: false,
  },
  {
    name: 'chat',
    version: '2.1.0',
    author: 'MetaBuilder',
    manifest: { entry: 'chat.lua' },
    isInstalled: true,
  },
]

beforeEach(() => {
  Object.values(mockAdapter).forEach(value => {
    if (typeof value === 'function' && 'mockReset' in value) {
      value.mockReset()
    }
  })
})

describe('DBALClient batch operations', () => {
  it('creates users in bulk via adapter', async () => {
    mockAdapter.createMany.mockResolvedValue(2)

    const client = new DBALClient(baseConfig)
    const result = await client.users.createMany(userBatch)

    expect(mockAdapter.createMany).toHaveBeenCalledWith('User', [
      { ...userBatch[0], tenantId: baseConfig.tenantId },
      { ...userBatch[1], tenantId: baseConfig.tenantId },
    ])
    expect(result).toBe(2)
  })

  it('rejects bulk user create with invalid data', async () => {
    const client = new DBALClient(baseConfig)

    await expect(client.users.createMany([
      { username: '', email: 'bad', role: 'user' as const },
    ])).rejects.toMatchObject({ code: DBALErrorCode.VALIDATION_ERROR })

    expect(mockAdapter.createMany).not.toHaveBeenCalled()
  })

  it('updates users in bulk with a filter', async () => {
    mockAdapter.updateMany.mockResolvedValue(1)

    const client = new DBALClient(baseConfig)
    const result = await client.users.updateMany({ role: 'user' }, { role: 'admin' })

    expect(mockAdapter.updateMany).toHaveBeenCalledWith(
      'User',
      { role: 'user', tenantId: baseConfig.tenantId },
      { role: 'admin' }
    )
    expect(result).toBe(1)
  })

  it('rejects bulk user update without a filter', async () => {
    const client = new DBALClient(baseConfig)

    await expect(client.users.updateMany({}, { role: 'admin' })).rejects.toMatchObject({
      code: DBALErrorCode.VALIDATION_ERROR,
    })
  })

  it('deletes users in bulk with a filter', async () => {
    mockAdapter.deleteMany.mockResolvedValue(2)

    const client = new DBALClient(baseConfig)
    const result = await client.users.deleteMany({ role: 'user' })

    expect(mockAdapter.deleteMany).toHaveBeenCalledWith('User', { role: 'user', tenantId: baseConfig.tenantId })
    expect(result).toBe(2)
  })

  it('creates packages in bulk via adapter', async () => {
    mockAdapter.createMany.mockResolvedValue(2)

    const client = new DBALClient(baseConfig)
    const result = await client.packages.createMany(packageBatch)

    expect(mockAdapter.createMany).toHaveBeenCalledWith('Package', [
      { ...packageBatch[0], tenantId: baseConfig.tenantId },
      { ...packageBatch[1], tenantId: baseConfig.tenantId },
    ])
    expect(result).toBe(2)
  })

  it('updates packages in bulk with a filter', async () => {
    mockAdapter.updateMany.mockResolvedValue(3)

    const client = new DBALClient(baseConfig)
    const result = await client.packages.updateMany({ isInstalled: false }, { isInstalled: true })

    expect(mockAdapter.updateMany).toHaveBeenCalledWith(
      'Package',
      { isInstalled: false, tenantId: baseConfig.tenantId },
      { isInstalled: true }
    )
    expect(result).toBe(3)
  })

  it('deletes packages in bulk with a filter', async () => {
    mockAdapter.deleteMany.mockResolvedValue(1)

    const client = new DBALClient(baseConfig)
    const result = await client.packages.deleteMany({ name: 'forum' })

    expect(mockAdapter.deleteMany).toHaveBeenCalledWith('Package', { name: 'forum', tenantId: baseConfig.tenantId })
    expect(result).toBe(1)
  })
})
