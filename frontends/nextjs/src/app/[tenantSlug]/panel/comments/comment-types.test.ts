import { describe, expect, it } from 'vitest'

import {
  commentsUrl,
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

describe('commentsUrl', () => {
  // The route is /{tenant}/{package}/{Entity}, with Entity taken from the
  // schema's own field in PascalCase -- ProfileComment lives under the
  // pastebin package, not core.
  it('addresses ProfileComment under the pastebin package', () => {
    expect(commentsUrl('acme')).toMatch(/\/acme\/pastebin\/ProfileComment$/)
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
    expect(toDbalRow(comment, 'acme')).toMatchObject({
      authorId: 'u1',
      profileUserId: 'u1',
      authorUsername: 'alice',
    })
  })

  /**
   * Every row carried `tenantId: 'system'` and the URL named that tenant
   * too, so every community on the instance posted into and read one
   * shared board -- a founder's members saw strangers' comments as their
   * own community's, and the founder could delete them.
   */
  it('stamps the community the comment was written in', () => {
    expect(toDbalRow(comment, 'acme').tenantId).toBe('acme')
    expect(toDbalRow(comment, 'acme').tenantId).not.toBe('system')
  })

  it('is never the shared board', () => {
    expect(commentsUrl('acme')).not.toContain('/system/')
  })

  it('round-trips back through toComment', () => {
    const written = toDbalRow(comment, 'acme') as unknown as DbalComment
    expect(toComment(written)).toEqual(comment)
  })
})
