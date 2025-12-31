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
}

const luaScriptInput = {
  name: 'health_check',
  description: 'Simple health check',
  code: 'return true',
  isSandboxed: true,
  allowedGlobals: ['math'],
  timeoutMs: 1000,
  createdBy: '11111111-1111-1111-1111-111111111111',
}

const luaScriptRecord = {
  ...luaScriptInput,
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

describe('DBALClient luaScripts', () => {
  it('creates lua scripts via adapter', async () => {
    mockAdapter.create.mockResolvedValue(luaScriptRecord)

    const client = new DBALClient(baseConfig)
    const result = await client.luaScripts.create(luaScriptInput)

    expect(mockAdapter.create).toHaveBeenCalledWith('LuaScript', luaScriptInput)
    expect(result).toEqual(luaScriptRecord)
  })

  it('rejects invalid lua script data before adapter call', async () => {
    const client = new DBALClient(baseConfig)

    await expect(client.luaScripts.create({
      ...luaScriptInput,
      name: '',
    })).rejects.toMatchObject({ code: DBALErrorCode.VALIDATION_ERROR })

    expect(mockAdapter.create).not.toHaveBeenCalled()
  })

  it('maps lua script create conflicts to friendly message', async () => {
    mockAdapter.create.mockRejectedValue(DBALError.conflict('unique violation'))

    const client = new DBALClient(baseConfig)

    await expect(client.luaScripts.create(luaScriptInput)).rejects.toMatchObject({
      code: DBALErrorCode.CONFLICT,
      message: "Lua script with name 'health_check' already exists",
    })
  })

  it('throws not found when reading missing lua scripts', async () => {
    mockAdapter.read.mockResolvedValue(null)

    const client = new DBALClient(baseConfig)

    await expect(client.luaScripts.read(luaScriptRecord.id)).rejects.toMatchObject({
      code: DBALErrorCode.NOT_FOUND,
    })
  })

  it('updates, deletes, and lists lua scripts', async () => {
    const updatedRecord = { ...luaScriptRecord, timeoutMs: 2000 }
    mockAdapter.update.mockResolvedValue(updatedRecord)
    mockAdapter.delete.mockResolvedValue(true)
    mockAdapter.list.mockResolvedValue({
      data: [luaScriptRecord],
      total: 1,
      page: 1,
      limit: 20,
      hasMore: false,
    })

    const client = new DBALClient(baseConfig)

    const updateResult = await client.luaScripts.update(luaScriptRecord.id, { timeoutMs: 2000 })
    expect(updateResult).toEqual(updatedRecord)

    const deleteResult = await client.luaScripts.delete(luaScriptRecord.id)
    expect(deleteResult).toBe(true)

    const listResult = await client.luaScripts.list()
    expect(listResult.data).toEqual([luaScriptRecord])
    expect(mockAdapter.list).toHaveBeenCalledWith('LuaScript', undefined)
  })
})
