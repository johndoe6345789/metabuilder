import { describe, expect, it } from 'vitest'

import { sanitizeContextForLogging } from './context-logging'
import type { ExtendedWorkflowContext } from '../multi-tenant-context'

const context = (over: Record<string, unknown> = {}) =>
  ({
    executionId: 'exec-1',
    tenantId: 'acme',
    userId: 'u1',
    trigger: { kind: 'manual' },
    executionLimits: { maxSeconds: 30 },
    variables: { apiKey: 'super-secret', password: 'hunter2' },
    multiTenant: {
      enforced: true,
      tenantId: 'acme',
      userId: 'u1',
      userLevel: 2,
      userEmail: 'dave@nunn-and-son.co.uk',
      requestedAt: '2026-01-01T00:00:00Z',
      ipAddress: '192.168.100.200',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
      sessionId: 'sess-abc123-do-not-log',
      executionMode: 'manual',
      ...(over.multiTenant as object),
    },
    ...over,
  }) as unknown as ExtendedWorkflowContext

describe('sanitizeContextForLogging', () => {
  it('never includes the session id', () => {
    // A session id in a log is a credential in a log.
    const out = JSON.stringify(sanitizeContextForLogging(context()))
    expect(out).not.toContain('sess-abc123-do-not-log')
    expect(out).not.toContain('sessionId')
  })

  it('logs variable names but never their values', () => {
    const out = sanitizeContextForLogging(context())
    expect(out.variables).toEqual(['apiKey', 'password'])
    expect(JSON.stringify(out)).not.toContain('hunter2')
  })

  it('masks the email down to its domain', () => {
    const meta = sanitizeContextForLogging(context()).multiTenant as {
      userEmail?: string
    }
    expect(meta.userEmail).toBe('***@nunn-and-son.co.uk')
  })

  it('shortens the address and the user agent', () => {
    const meta = sanitizeContextForLogging(context()).multiTenant as {
      ipAddress?: string
      userAgent?: string
    }
    expect(meta.ipAddress).toBe('192.168.10...')
    expect(meta.userAgent?.endsWith('...')).toBe(true)
  })

  it('keeps what makes a log entry useful', () => {
    const out = sanitizeContextForLogging(context())
    expect(out.executionId).toBe('exec-1')
    expect(out.tenantId).toBe('acme')
    expect(out.trigger).toBe('manual')
  })

  it('does not carry through a field added to the metadata later', () => {
    // Fields are named one by one precisely so a new secret in the metadata
    // is not logged by default.
    const out = sanitizeContextForLogging(
      context({ multiTenant: { refreshToken: 'rt-leak' } })
    )
    expect(JSON.stringify(out)).not.toContain('rt-leak')
  })
})
