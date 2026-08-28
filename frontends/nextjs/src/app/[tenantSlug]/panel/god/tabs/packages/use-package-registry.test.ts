import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

const store = vi.hoisted(() => ({
  packages: [] as unknown[],
  dispatch: vi.fn(),
}))

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => store.dispatch,
  useAppSelector: (fn: (s: unknown) => unknown) =>
    fn({ god: { packages: store.packages } }),
}))
vi.mock('@/store/slices/god-slice', () => ({
  setPackages: (p: unknown) => ({ type: 'setPackages', payload: p }),
}))

import { usePackageRegistry } from './use-package-registry'

const pkg = (id: string, over: Record<string, unknown> = {}) => ({
  manifest: { id, name: id, installed: true, updatedAt: 1 },
  content: {},
  archived: false,
  workflows: [],
  pageConfigs: [],
  themeId: null,
  publishedId: 'pub_1',
  ...over,
})

/** What the hook last asked the store to persist. */
const persisted = () =>
  store.dispatch.mock.calls.at(-1)?.[0].payload as ReturnType<typeof pkg>[]

describe('usePackageRegistry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    store.packages = []
  })

  describe('create', () => {
    it('adds a package and returns its id', () => {
      const { result } = renderHook(() => usePackageRegistry())

      let id = ''
      act(() => {
        id = result.current.create('Forum')
      })

      expect(persisted()).toHaveLength(1)
      expect(persisted()[0].manifest.id).toBe(id)
    })

    it('names an unnamed package rather than leaving it blank', () => {
      const { result } = renderHook(() => usePackageRegistry())

      act(() => result.current.create('   '))

      expect(persisted()[0].manifest.name).toBe('Untitled Package')
    })

    it('keeps the packages that were already there', () => {
      store.packages = [pkg('a')]
      const { result } = renderHook(() => usePackageRegistry())

      act(() => result.current.create('B'))

      expect(persisted()).toHaveLength(2)
    })

    it('starts unarchived and unpublished', () => {
      const { result } = renderHook(() => usePackageRegistry())

      act(() => result.current.create('Forum'))

      expect(persisted()[0].archived).toBe(false)
      expect(persisted()[0].publishedId).toBeNull()
    })
  })

  describe('update', () => {
    beforeEach(() => {
      store.packages = [pkg('a'), pkg('b')]
    })

    it('patches only the named package', () => {
      const { result } = renderHook(() => usePackageRegistry())

      act(() => result.current.update('a', { name: 'Renamed' }))

      expect(persisted()[0].manifest.name).toBe('Renamed')
      expect(persisted()[1].manifest.name).toBe('b')
    })

    it('stamps updatedAt', () => {
      const { result } = renderHook(() => usePackageRegistry())

      act(() => result.current.update('a', { name: 'Renamed' }))

      expect(persisted()[0].manifest.updatedAt).not.toBe(1)
    })

    it('ignores an id that is not there', () => {
      const { result } = renderHook(() => usePackageRegistry())

      act(() => result.current.update('nope', { name: 'X' }))

      expect(persisted().map(p => p.manifest.name)).toEqual(['a', 'b'])
    })
  })

  describe('updateContents', () => {
    it('patches the reference fields without touching the manifest', () => {
      store.packages = [pkg('a')]
      const { result } = renderHook(() => usePackageRegistry())

      act(() => result.current.updateContents('a', { themeId: 't1' }))

      expect(persisted()[0].themeId).toBe('t1')
      expect(persisted()[0].manifest.updatedAt).toBe(1)
    })
  })

  describe('archiving', () => {
    it('archives and unarchives', () => {
      store.packages = [pkg('a')]
      const { result } = renderHook(() => usePackageRegistry())

      act(() => result.current.setArchived('a', true))
      expect(persisted()[0].archived).toBe(true)

      store.packages = persisted()
      act(() => result.current.setArchived('a', false))
      expect(persisted()[0].archived).toBe(false)
    })
  })

  describe('remove', () => {
    it('drops just that package', () => {
      store.packages = [pkg('a'), pkg('b')]
      const { result } = renderHook(() => usePackageRegistry())

      act(() => result.current.remove('a'))

      expect(persisted().map(p => p.manifest.id)).toEqual(['b'])
    })
  })

  describe('duplicate', () => {
    beforeEach(() => {
      store.packages = [pkg('a', { archived: true })]
    })

    it('adds a copy under a new id', () => {
      const { result } = renderHook(() => usePackageRegistry())

      act(() => result.current.duplicate('a'))

      expect(persisted()).toHaveLength(2)
      expect(persisted()[1].manifest.id).not.toBe('a')
    })

    it('marks the copy as a copy', () => {
      const { result } = renderHook(() => usePackageRegistry())

      act(() => result.current.duplicate('a'))

      expect(persisted()[1].manifest.name).toBe('a (copy)')
    })

    it('makes the copy an unpublished, uninstalled, unarchived draft', () => {
      // A copy that inherited publishedId would claim to be the published
      // package it was copied from.
      const { result } = renderHook(() => usePackageRegistry())

      act(() => result.current.duplicate('a'))

      const copy = persisted()[1]
      expect(copy.publishedId).toBeNull()
      expect(copy.manifest.installed).toBe(false)
      expect(copy.archived).toBe(false)
    })

    it('does nothing for an id that is not there', () => {
      const { result } = renderHook(() => usePackageRegistry())

      act(() => result.current.duplicate('nope'))

      expect(store.dispatch).not.toHaveBeenCalled()
    })
  })
})
