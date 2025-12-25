import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SecurityContext } from './types'
import type { User } from '@/lib/types/level-types'
import { logOperation } from './log-operation'
import { getAuditLogs } from './operations/get-audit-logs'
import { clearAuditLogs } from './audit-log-store'

const baseUser: User = {
  id: 'user-1',
  username: 'admin',
  email: 'admin@example.com',
  role: 'god',
  createdAt: 0,
}

const baseContext: SecurityContext = {
  user: baseUser,
  ipAddress: '127.0.0.1',
}

describe('audit log storage', () => {
  beforeEach(() => {
    clearAuditLogs()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'))
  })

  afterEach(() => {
    clearAuditLogs()
    vi.useRealTimers()
  })

  it('returns the newest audit entries first with limits', async () => {
    await logOperation(baseContext, 'CREATE', 'user', 'user-1', true)
    vi.setSystemTime(new Date('2024-01-01T00:00:01Z'))
    await logOperation(baseContext, 'UPDATE', 'user', 'user-2', false, 'update failed')
    vi.setSystemTime(new Date('2024-01-01T00:00:02Z'))
    await logOperation(baseContext, 'DELETE', 'user', 'user-3', true)

    const logs = await getAuditLogs(baseContext, 2)

    expect(logs).toHaveLength(2)
    expect(logs[0].resourceId).toBe('user-3')
    expect(logs[1].resourceId).toBe('user-2')
    expect(logs[1].errorMessage).toBe('update failed')
  })

  it('rejects non-god access to audit logs', async () => {
    const ctx: SecurityContext = {
      ...baseContext,
      user: { ...baseUser, role: 'user' },
    }

    await expect(getAuditLogs(ctx)).rejects.toThrow('Access denied')
  })
})
