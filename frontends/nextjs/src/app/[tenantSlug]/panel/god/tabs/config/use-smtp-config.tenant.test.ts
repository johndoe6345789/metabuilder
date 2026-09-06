import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

const godTenant = vi.hoisted(() => ({ useGodTenant: vi.fn() }))
vi.mock('../use-god-tenant', () => godTenant)

/** Another tenant's outbound mail settings, password and all. */
const theirs = {
  host: 'smtp.harbourcycle.example',
  port: 587,
  secure: true,
  username: 'rosa@harbourcycle.example',
  password: 'their-real-password',
  fromEmail: 'rosa@harbourcycle.example',
  fromName: 'Harbour Cycle Works',
}
const store = vi.hoisted(() => ({ smtp: {} as unknown, dirty: true }))
vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => () => undefined,
  useAppSelector: (fn: (s: unknown) => unknown) =>
    fn({ god: { smtp: store.smtp, dirty: { smtp: store.dirty } } }),
}))

import { useSmtpConfig } from './use-smtp-config'

beforeEach(() => {
  vi.clearAllMocks()
  store.smtp = theirs
  store.dirty = true
})

/**
 * These settings persist per browser origin like the rest of the god
 * slice, but are published under a tenant id -- and they carry a
 * password. Without the guard, a founder signing in after someone else in
 * the same browser was shown that person's mail server, username and
 * password, marked as their own unpublished changes.
 */
describe('another tenant’s SMTP settings', () => {
  const asForeign = () =>
    godTenant.useGodTenant.mockReturnValue({
      tenant: 'kestrelbindery',
      known: true,
      foreign: true,
    })

  it('never hand out the password', () => {
    asForeign()
    const { result } = renderHook(() => useSmtpConfig())
    expect(result.current.config.password).toBe('')
  })

  it('never hand out the host or username either', () => {
    asForeign()
    const { result } = renderHook(() => useSmtpConfig())
    expect(result.current.config.host).toBe('')
    expect(result.current.config.username).toBe('')
  })

  it('are not offered as this tenant’s unpublished changes', () => {
    asForeign()
    const { result } = renderHook(() => useSmtpConfig())
    expect(result.current.dirty).toBe(false)
  })

  it('leave this tenant its own settings alone', () => {
    godTenant.useGodTenant.mockReturnValue({
      tenant: 'harbour_cycle_works',
      known: true,
      foreign: false,
    })
    const { result } = renderHook(() => useSmtpConfig())
    expect(result.current.config).toEqual(theirs)
    expect(result.current.dirty).toBe(true)
  })
})
