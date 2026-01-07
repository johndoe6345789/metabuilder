import { describe, expect, it } from 'vitest'
import { createInMemoryStore } from '../../../src/core/store/in-memory-store'
import { createUser } from '../../../src/core/entities/user'
import { createSession, getSession, getSessionByToken, listSessions, updateSession } from '../../../src/core/entities/session'

describe('session in-memory operations', () => {
  it('handles token uniqueness and updates', async () => {
    const store = createInMemoryStore()
    const userResult = await createUser(store, {
      username: 'session_owner',
      email: 'session_owner@example.com',
      role: 'user'
    })

    expect(userResult.success).toBe(true)
    if (!userResult.success) return

    const expiresAt = BigInt(Date.now() + 60_000)
    const createResult = await createSession(store, {
      userId: userResult.data.id,
      token: 'token-1',
      expiresAt
    })

    expect(createResult.success).toBe(true)
    if (!createResult.success) return

    const duplicate = await createSession(store, {
      userId: userResult.data.id,
      token: 'token-1',
      expiresAt
    })

    expect(duplicate.success).toBe(false)
    if (!duplicate.success) {
      expect(duplicate.error.code).toBe('CONFLICT')
    }

    const updateResult = await updateSession(store, createResult.data.id, {
      token: 'token-2'
    })

    expect(updateResult.success).toBe(true)

    const byToken = await getSessionByToken(store, 'token-2')
    expect(byToken.success).toBe(true)

    const listResult = await listSessions(store, {
      filter: { userId: userResult.data.id }
    })

    expect(listResult.success).toBe(true)
    if (listResult.success) {
      expect(listResult.data).toHaveLength(1)
    }
  })

  it('expires sessions on read', async () => {
    const store = createInMemoryStore()
    const userResult = await createUser(store, {
      username: 'session_owner',
      email: 'session_owner@example.com',
      role: 'user'
    })

    expect(userResult.success).toBe(true)
    if (!userResult.success) return

    const expired = await createSession(store, {
      userId: userResult.data.id,
      token: 'token-expired',
      expiresAt: BigInt(Date.now() - 1000)
    })

    expect(expired.success).toBe(true)
    if (!expired.success) return

    const readResult = await getSession(store, expired.data.id)
    expect(readResult.success).toBe(false)
    if (!readResult.success) {
      expect(readResult.error.code).toBe('NOT_FOUND')
    }
  })
})
