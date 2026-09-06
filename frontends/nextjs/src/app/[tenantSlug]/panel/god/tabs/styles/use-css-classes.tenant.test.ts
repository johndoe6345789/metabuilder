import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

const godTenant = vi.hoisted(() => ({ useGodTenant: vi.fn() }))
vi.mock('../use-god-tenant', () => godTenant)

const other = [
  { id: 'c1', name: 'darkroom-card', props: { background: '#1a1210' } },
  { id: 'c2', name: 'hero-panel', props: { padding: '40' } },
]
const store = vi.hoisted(() => ({ css: [] as unknown[], dirty: true }))
vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => () => undefined,
  useAppSelector: (fn: (s: unknown) => unknown) =>
    fn({ god: { css: store.css, dirty: { css: store.dirty } } }),
}))

import { SEED_CSS } from '@/store/slices/god-slice/seed-css'
import { useCssClasses } from './use-css-classes'

beforeEach(() => {
  vi.clearAllMocks()
  store.css = other
  store.dirty = true
})

/**
 * The styles slice persists per browser origin, so a founder signing in
 * after someone else in the same browser was shown the other tenant's
 * classes -- and the tab said "Staged changes", one click from publishing
 * them into their own data. Caught on a tenant created minutes earlier,
 * showing `darkroom-card` and `hero-panel` from an unrelated site.
 */
describe('another tenant’s styles', () => {
  it('are never handed out', () => {
    godTenant.useGodTenant.mockReturnValue({
      tenant: 'kestrelbindery',
      known: true,
      foreign: true,
    })

    const { result } = renderHook(() => useCssClasses())

    expect(result.current.classes).toEqual(SEED_CSS)
    expect(result.current.classes).not.toContainEqual(other[0])
  })

  // Otherwise the tab offers to publish someone else's work as yours.
  it('are not reported as this tenant’s unpublished changes', () => {
    godTenant.useGodTenant.mockReturnValue({
      tenant: 'kestrelbindery',
      known: true,
      foreign: true,
    })

    const { result } = renderHook(() => useCssClasses())

    expect(result.current.dirty).toBe(false)
  })

  it('leaves this tenant its own styles alone', () => {
    godTenant.useGodTenant.mockReturnValue({
      tenant: 'kestrelbindery',
      known: true,
      foreign: false,
    })

    const { result } = renderHook(() => useCssClasses())

    expect(result.current.classes).toEqual(other)
    expect(result.current.dirty).toBe(true)
  })
})
