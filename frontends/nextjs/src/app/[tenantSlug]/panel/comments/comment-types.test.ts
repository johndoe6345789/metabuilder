import { describe, expect, it } from 'vitest'

import {
  COMMENTS_URL,
  toComment,
  toDbalRow,
  type Comment,
  type DbalComment,
} from './comment-types'

const row: DbalComment = {
  id: 'c1',
  authorId: 'u1',
  authorUsername: 'alice',
  content: 'hello',
  createdAt: 1700000000000,
}

describe('COMMENTS_URL', () => {
  // The route is /{tenant}/{package}/{Entity}, with Entity taken from the
  // schema's own field in PascalCase -- ProfileComment lives under the
  // pastebin package, not core.
  it('addresses ProfileComment under the pastebin package', () => {
    expect(COMMENTS_URL).toMatch(/\/system\/pastebin\/ProfileComment$/)
  })
})

describe('toComment', () => {
  it('renames the author fields to what the board reads', () => {
    expect(toComment(row)).toEqual({
      id: 'c1',
      userId: 'u1',
      username: 'alice',
      content: 'hello',
      createdAt: 1700000000000,
    })
  })

  it('falls back to now when the row carries no timestamp', () => {
    const { createdAt, ...rest } = row
    void createdAt
    expect(toComment(rest, 42).createdAt).toBe(42)
  })
})

describe('toDbalRow', () => {
  const comment: Comment = {
    id: 'c1',
    userId: 'u1',
    username: 'alice',
    content: 'hello',
    createdAt: 5,
  }

  it('writes the author on both id fields', () => {
    expect(toDbalRow(comment)).toMatchObject({
      authorId: 'u1',
      profileUserId: 'u1',
      authorUsername: 'alice',
    })
  })

  it('stamps the system tenant', () => {
    expect(toDbalRow(comment).tenantId).toBe('system')
  })

  it('round-trips back through toComment', () => {
    const written = toDbalRow(comment) as unknown as DbalComment
    expect(toComment(written)).toEqual(comment)
  })
})
