import { afterEach,describe, expect, it } from 'vitest'

import {
  AUTH_TOKEN_HEADER,
  AUTHORIZATION_HEADER,
  isAuthorized,
  splitSqlTemplate,
} from './native-prisma-bridge'

function stubRequest(headers: Record<string, string | undefined>) {
  return {
    headers: {
      get(name: string) {
        return headers[name] ?? null
      },
    },
  } as unknown as Request
}

describe('splitSqlTemplate', () => {
  it('parses dollar placeholders and handles duplicates', () => {
    const result = splitSqlTemplate('SELECT * FROM users WHERE id = $1 OR parent_id = $1', ['abc'])
    expect(result.strings).toEqual(['SELECT * FROM users WHERE id = ', ' OR parent_id = ', ''])
    expect(result.values).toEqual(['abc', 'abc'])
  })

  it('falls back to question mark placeholders', () => {
    const result = splitSqlTemplate('INSERT INTO settings VALUES (?, ?)', ['a', 'b'])
    expect(result.strings).toEqual(['INSERT INTO settings VALUES (', ', ', ')'])
    expect(result.values).toEqual(['a', 'b'])
  })

  it('throws when parameter counts mismatch for question marks', () => {
    expect(() => splitSqlTemplate('SELECT * FROM x WHERE id = ?', [])).toThrow(/parameter mismatch/)
  })
})

describe('isAuthorized', () => {
  const originalEnv = process.env.DBAL_NATIVE_PRISMA_TOKEN

  afterEach(() => {
    process.env.DBAL_NATIVE_PRISMA_TOKEN = originalEnv
  })

  it('allows when the token header matches', () => {
    process.env.DBAL_NATIVE_PRISMA_TOKEN = 'secret'
    const request = stubRequest({ [AUTH_TOKEN_HEADER]: 'secret' })
    expect(isAuthorized(request)).toBe(true)
  })

  it('allows bearer authorization headers', () => {
    process.env.DBAL_NATIVE_PRISMA_TOKEN = 'secret'
    const request = stubRequest({ [AUTHORIZATION_HEADER]: 'Bearer secret' })
    expect(isAuthorized(request)).toBe(true)
  })

  it('denies when no header matches', () => {
    process.env.DBAL_NATIVE_PRISMA_TOKEN = 'secret'
    const request = stubRequest({ [AUTH_TOKEN_HEADER]: 'wrong' })
    expect(isAuthorized(request)).toBe(false)
  })

  it('allows when no secret is configured', () => {
    process.env.DBAL_NATIVE_PRISMA_TOKEN = ''
    const request = stubRequest({})
    expect(isAuthorized(request)).toBe(true)
  })
})
