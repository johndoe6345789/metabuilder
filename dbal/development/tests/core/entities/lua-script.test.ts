import { describe, expect, it } from 'vitest'
import { createInMemoryStore } from '../../../src/core/store/in-memory-store'
import { createUser } from '../../../src/core/entities/user'
import { createLuaScript, deleteLuaScript, listLuaScripts, updateLuaScript } from '../../../src/core/entities/lua-script'

describe('lua script in-memory operations', () => {
  it('creates, lists, updates, and deletes scripts', async () => {
    const store = createInMemoryStore()

    const userResult = await createUser(store, {
      username: 'lua_owner',
      email: 'lua_owner@example.com'
    })

    expect(userResult.success).toBe(true)
    if (!userResult.success) return

    const createResult = await createLuaScript(store, {
      name: 'health_check',
      description: 'Health check',
      code: 'return true',
      parameters: '[]',
      allowedGlobals: '["math"]',
      timeoutMs: 1000,
      createdBy: userResult.data.id
    })

    expect(createResult.success).toBe(true)
    if (!createResult.success) return

    const listResult = await listLuaScripts(store, {
      filter: { isSandboxed: true }
    })

    expect(listResult.success).toBe(true)
    if (listResult.success) {
      expect(listResult.data).toHaveLength(1)
    }

    const updateResult = await updateLuaScript(store, createResult.data.id, {
      timeoutMs: 2000
    })

    expect(updateResult.success).toBe(true)
    if (updateResult.success) {
      expect(updateResult.data.timeoutMs).toBe(2000)
    }

    const deleteResult = await deleteLuaScript(store, createResult.data.id)
    expect(deleteResult.success).toBe(true)
  })

  it('rejects duplicate script names', async () => {
    const store = createInMemoryStore()

    const userResult = await createUser(store, {
      username: 'lua_owner',
      email: 'lua_owner@example.com'
    })

    expect(userResult.success).toBe(true)
    if (!userResult.success) return

    const first = await createLuaScript(store, {
      name: 'dupe',
      code: 'return true',
      parameters: '[]',
      allowedGlobals: '["math"]',
      timeoutMs: 1000,
      createdBy: userResult.data.id
    })

    expect(first.success).toBe(true)

    const second = await createLuaScript(store, {
      name: 'dupe',
      code: 'return true',
      parameters: '[]',
      allowedGlobals: '["math"]',
      timeoutMs: 1000,
      createdBy: userResult.data.id
    })

    expect(second.success).toBe(false)
    if (!second.success) {
      expect(second.error.code).toBe('CONFLICT')
    }
  })
})
