import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

const store = vi.hoisted(() => ({ rehydrated: null as unknown }))
const persist = vi.hoisted(() => ({
  idbDump: vi.fn(async () => ({})),
  idbRestore: vi.fn(async () => undefined),
}))
vi.mock('@/lib/persist/idb-kv', () => persist)
vi.mock('../use-current-tenant-scope', () => ({
  useCurrentTenantScope: () => ({
    tenant: 'kestrel',
    canPickOtherTenant: false,
  }),
}))
vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => (action: { type: string; payload?: unknown }) => {
    if (action.type === 'rehydrate') store.rehydrated = action.payload
  },
  useAppSelector: (fn: (s: unknown) => unknown) => fn({ god: {} }),
}))
vi.mock('@/store/slices/god-slice', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    rehydrate: (payload: unknown) => ({ type: 'rehydrate', payload }),
  }
})

import { useDeploy } from './use-deploy'

const file = (text: string) =>
  ({ text: async () => text }) as unknown as File

const bundleFrom = (tenant: string) =>
  JSON.stringify({
    kind: 'metabuilder-project',
    version: 3,
    tenant,
    god: { smtp: { password: 'theirs' } },
    idb: {},
  })

beforeEach(() => {
  vi.clearAllMocks()
  store.rehydrated = null
})

/**
 * The god slice carries the page tree, the CSS, the workflows and the
 * SMTP host, username and password. The bundle recorded none of that as
 * belonging to anyone, so one community's export dropped into another
 * browser silently became that community's own drafts.
 */
describe('importing somebody else’s project', () => {
  it('refuses it, and says whose it is', async () => {
    const { result } = renderHook(() => useDeploy())

    await act(async () => {
      await result.current.importProject(file(bundleFrom('harbour')))
    })

    expect(store.rehydrated).toBeNull()
    expect(persist.idbRestore).not.toHaveBeenCalled()
    expect(result.current.flash).toContain('harbour')
    expect(result.current.flash).toContain('kestrel')
  })

  it('restores this community’s own', async () => {
    const { result } = renderHook(() => useDeploy())

    await act(async () => {
      await result.current.importProject(file(bundleFrom('kestrel')))
    })

    expect(store.rehydrated).toEqual({ smtp: { password: 'theirs' } })
    expect(result.current.flash).toBe('Project imported.')
  })
})
