import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { deleteUser, fetchCommentCount, fetchUsers } from './admin-api'
import { USERS_URL } from './admin-types'

interface Call {
  url: string
  method?: string
  credentials?: string
}

const stub = (
  responder: (url: string) => { ok: boolean; body?: unknown }
): Call[] => {
  const calls: Call[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({
        url: String(url),
        method: init?.method,
        credentials: init?.credentials,
      })
      const { ok, body } = responder(String(url))
      return { ok, json: async () => body } as Response
    })
  )
  return calls
}

const envelope = (rows: unknown[]) => ({ data: { data: rows } })

beforeEach(() => vi.clearAllMocks())
afterEach(() => vi.unstubAllGlobals())

describe('fetchUsers', () => {
  it('reads rows out of the real DBAL envelope', async () => {
    stub(() => ({ ok: true, body: envelope([{ id: '1' }, { id: '2' }]) }))
    expect(await fetchUsers()).toHaveLength(2)
  })

  it('sends the session cookie', async () => {
    const calls = stub(() => ({ ok: true, body: envelope([]) }))
    await fetchUsers()
    expect(calls[0]?.credentials).toBe('include')
    expect(calls[0]?.url).toBe(USERS_URL)
  })

  // An empty table and an unreachable data layer are different answers,
  // and the panel says something different for each.
  it('is an empty array for an empty table', async () => {
    stub(() => ({ ok: true, body: envelope([]) }))
    expect(await fetchUsers()).toEqual([])
  })

  it('is null when the request is refused', async () => {
    stub(() => ({ ok: false }))
    expect(await fetchUsers()).toBeNull()
  })

  it('is null when the data layer is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('ECONNREFUSED')
    }))
    expect(await fetchUsers()).toBeNull()
  })
})

describe('fetchCommentCount', () => {
  it('counts the rows it was given', async () => {
    stub(() => ({ ok: true, body: envelope([{}, {}, {}]) }))
    expect(await fetchCommentCount()).toBe(3)
  })

  it('is null when the count cannot be established', async () => {
    stub(() => ({ ok: false }))
    expect(await fetchCommentCount()).toBeNull()
  })
})

describe('deleteUser', () => {
  // The delete used to be a local array filter, so the account survived
  // while the operator watched it disappear.
  it('sends a DELETE to the account\'s own URL', async () => {
    const calls = stub(() => ({ ok: true }))
    expect(await deleteUser('u1')).toBe(true)
    expect(calls[0]?.method).toBe('DELETE')
    expect(calls[0]?.url).toBe(`${USERS_URL}/u1`)
    expect(calls[0]?.credentials).toBe('include')
  })

  it('reports false when the data layer refuses', async () => {
    stub(() => ({ ok: false }))
    expect(await deleteUser('u1')).toBe(false)
  })

  it('reports false rather than throwing when it cannot connect', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('ECONNREFUSED')
    }))
    expect(await deleteUser('u1')).toBe(false)
  })
})
