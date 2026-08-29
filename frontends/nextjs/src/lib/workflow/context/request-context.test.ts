import { beforeEach, describe, expect, it, vi } from 'vitest'

const session = vi.hoisted(() => ({ fetchSession: vi.fn() }))
vi.mock('@/lib/auth/api/fetch-session', () => session)

import {
  bearerToken,
  extractRequestContext,
  toWorkflowLevel,
} from './request-context'

const user = (over = {}) => ({
  id: 'u1',
  username: 'alice',
  email: 'alice@example.com',
  role: 'admin',
  tenantId: 'acme',
  createdAt: 0,
  ...over,
})

beforeEach(() => {
  vi.clearAllMocks()
  session.fetchSession.mockResolvedValue(user())
})

describe('bearerToken', () => {
  it('reads a lowercase authorization header', () => {
    expect(bearerToken({ authorization: 'Bearer abc' })).toBe('abc')
  })

  it('reads a capitalised one', () => {
    expect(bearerToken({ Authorization: 'Bearer abc' })).toBe('abc')
  })

  it.each([
    [undefined, 'no headers'],
    [null, 'null headers'],
  ])('is null for %p (%s)', headers => {
    expect(bearerToken(headers)).toBeNull()
  })

  it.each([
    {},
    { authorization: '' },
    { authorization: 'Basic YWxpY2U6cHc=' },
    { authorization: 'bearer abc' },
  ])('is null for %j', headers => {
    expect(bearerToken(headers)).toBeNull()
  })
})

describe('toWorkflowLevel', () => {
  // The app's roles run 0..5; a workflow's levels run 1..4, and the safety
  // check rejects anything outside that.
  it.each([
    [0, 1],
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 4],
    [5, 4],
    [99, 4],
  ])('maps role level %i to %i', (role, expected) => {
    expect(toWorkflowLevel(role)).toBe(expected)
  })
})

describe('extractRequestContext', () => {
  it('is null with no bearer token, and never calls out', async () => {
    expect(await extractRequestContext({})).toBeNull()
    expect(session.fetchSession).not.toHaveBeenCalled()
  })

  // The token is verified against the data layer rather than decoded and
  // believed: this context decides which tenant a run reads and writes.
  it('verifies the token rather than decoding it', async () => {
    await extractRequestContext({ authorization: 'Bearer tok' })
    expect(session.fetchSession).toHaveBeenCalledWith('tok')
  })

  it('is null when the token does not verify', async () => {
    session.fetchSession.mockResolvedValue(null)
    expect(
      await extractRequestContext({ authorization: 'Bearer forged' })
    ).toBeNull()
  })

  it('builds the context from the verified session', async () => {
    expect(
      await extractRequestContext({ authorization: 'Bearer tok' })
    ).toMatchObject({
      tenantId: 'acme',
      userId: 'u1',
      userEmail: 'alice@example.com',
      userLevel: 3,
    })
  })

  it('caps a supergod at the workflow super-admin level', async () => {
    session.fetchSession.mockResolvedValue(user({ role: 'supergod' }))
    const context = await extractRequestContext({
      authorization: 'Bearer tok',
    })
    expect(context?.userLevel).toBe(4)
  })

  // An unauthenticated caller has no workflow context to build.
  it.each(['public', 'unknown-role', ''])(
    'is null for the %p role',
    async role => {
      session.fetchSession.mockResolvedValue(user({ role }))
      expect(
        await extractRequestContext({ authorization: 'Bearer tok' })
      ).toBeNull()
    }
  )

  it('is null for a session with no id to scope the run to', async () => {
    session.fetchSession.mockResolvedValue(user({ id: undefined }))
    expect(
      await extractRequestContext({ authorization: 'Bearer tok' })
    ).toBeNull()
  })

  it('falls back to the system tenant when the user has none', async () => {
    session.fetchSession.mockResolvedValue(user({ tenantId: null }))
    const context = await extractRequestContext({
      authorization: 'Bearer tok',
    })
    expect(context?.tenantId).toBe('system')
  })

  it('carries the forwarding and agent headers through', async () => {
    const context = await extractRequestContext({
      authorization: 'Bearer tok',
      'x-forwarded-for': '10.0.0.1',
      'user-agent': 'curl/8',
    })
    expect(context).toMatchObject({
      ipAddress: '10.0.0.1',
      userAgent: 'curl/8',
    })
  })
})
