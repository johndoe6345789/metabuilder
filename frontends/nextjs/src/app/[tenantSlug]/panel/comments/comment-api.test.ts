import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { deleteComment, fetchComments, postComment } from './comment-api'
import { COMMENTS_URL, type Comment } from './comment-types'

interface Call {
  url: string
  method?: string
  body?: string
}

const stub = (ok: boolean, body?: unknown): Call[] => {
  const calls: Call[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({
        url: String(url),
        method: init?.method,
        body: init?.body as string | undefined,
      })
      return { ok, json: async () => body } as Response
    })
  )
  return calls
}

const comment: Comment = {
  id: 'c1',
  userId: 'u1',
  username: 'alice',
  content: 'hello',
  createdAt: 5,
}

beforeEach(() => vi.clearAllMocks())
afterEach(() => vi.unstubAllGlobals())

describe('fetchComments', () => {
  it('reads the rows out of the real DBAL envelope', async () => {
    stub(true, {
      data: {
        data: [
          { id: 'c1', authorId: 'u1', authorUsername: 'a', content: 'x' },
        ],
      },
    })
    const rows = await fetchComments()
    expect(rows).toHaveLength(1)
    expect(rows?.[0]?.username).toBe('a')
  })

  it('is an empty array for an empty board', async () => {
    stub(true, { data: { data: [] } })
    expect(await fetchComments()).toEqual([])
  })

  // Empty and unreachable are different answers; the page says something
  // different for each rather than inventing a welcome message.
  it('is null when the board is refused', async () => {
    stub(false)
    expect(await fetchComments()).toBeNull()
  })

  it('is null when the board is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('timeout')
    }))
    expect(await fetchComments()).toBeNull()
  })
})

describe('postComment', () => {
  it('posts the mapped row', async () => {
    const calls = stub(true)
    expect(await postComment(comment)).toBe(true)
    expect(calls[0]?.method).toBe('POST')
    expect(JSON.parse(calls[0]?.body ?? '{}')).toMatchObject({
      authorId: 'u1',
      content: 'hello',
    })
  })

  it('reports false when the write is refused', async () => {
    stub(false)
    expect(await postComment(comment)).toBe(false)
  })

  it('reports false rather than throwing on a network failure', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('offline')
    }))
    expect(await postComment(comment)).toBe(false)
  })
})

describe('deleteComment', () => {
  it('deletes the comment at its own URL', async () => {
    const calls = stub(true)
    expect(await deleteComment('c1')).toBe(true)
    expect(calls[0]?.url).toBe(`${COMMENTS_URL}/c1`)
    expect(calls[0]?.method).toBe('DELETE')
  })

  it('reports false when the delete is refused', async () => {
    stub(false)
    expect(await deleteComment('c1')).toBe(false)
  })
})
