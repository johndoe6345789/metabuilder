import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

const store = vi.hoisted(() => ({
  css: [] as unknown[],
  dirty: false,
  dispatch: vi.fn(),
}))
const styleApi = vi.hoisted(() => ({
  loadStyleClasses: vi.fn(async () => []),
  saveStyleClasses: vi.fn(async () => true),
  styleSheetText: vi.fn(() => ''),
}))

// The tenant guard is exercised in use-css-classes.tenant.test.ts; here
// the draft is always this tenant's own.
vi.mock('../use-god-tenant', () => ({
  useGodTenant: () => ({ tenant: 'acme', known: true, foreign: false }),
}))
vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => store.dispatch,
  useAppSelector: (fn: (s: unknown) => unknown) =>
    fn({ god: { css: store.css, dirty: { css: store.dirty } } }),
}))
vi.mock('@/store/slices/god-slice', () => ({
  setCss: (p: unknown) => ({ type: 'setCss', payload: p }),
  clearDirty: (p: unknown) => ({ type: 'clearDirty', payload: p }),
}))
vi.mock('@/lib/tenant/style-classes', () => styleApi)

import { useCssClasses } from './use-css-classes'

const cls = (id: string, name = id, props = {}) => ({ id, name, props })

const persisted = () =>
  store.dispatch.mock.calls
    .map(c => c[0])
    .filter(a => a.type === 'setCss')
    .at(-1)?.payload as ReturnType<typeof cls>[]

describe('useCssClasses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    store.css = []
    store.dirty = false
    styleApi.loadStyleClasses.mockResolvedValue([])
    styleApi.saveStyleClasses.mockResolvedValue(true)
  })

  describe('create', () => {
    it('adds a class and returns its id', () => {
      const { result } = renderHook(() => useCssClasses())

      let id = ''
      act(() => {
        id = result.current.create('card')
      })

      expect(persisted()).toHaveLength(1)
      expect(persisted()[0].id).toBe(id)
      expect(persisted()[0].name).toBe('card')
    })

    it('names an unnamed class rather than leaving it blank', () => {
      const { result } = renderHook(() => useCssClasses())

      act(() => result.current.create('   '))

      expect(persisted()[0].name).toBe('new-class')
    })

    it('starts with no properties', () => {
      const { result } = renderHook(() => useCssClasses())

      act(() => result.current.create('card'))

      expect(persisted()[0].props).toEqual({})
    })
  })

  describe('rename', () => {
    it('renames only the named class', () => {
      store.css = [cls('c1', 'a'), cls('c2', 'b')]
      const { result } = renderHook(() => useCssClasses())

      act(() => result.current.rename('c1', 'renamed'))

      expect(persisted().map(c => c.name)).toEqual(['renamed', 'b'])
    })
  })

  describe('properties', () => {
    beforeEach(() => {
      store.css = [cls('c1', 'card', { color: 'red' })]
    })

    it('adds a property', () => {
      const { result } = renderHook(() => useCssClasses())

      act(() => result.current.setProp('c1', 'padding', '8px'))

      expect(persisted()[0].props).toEqual({ color: 'red', padding: '8px' })
    })

    it('overwrites an existing property', () => {
      const { result } = renderHook(() => useCssClasses())

      act(() => result.current.setProp('c1', 'color', 'blue'))

      expect(persisted()[0].props).toEqual({ color: 'blue' })
    })

    it('removes a property entirely', () => {
      // Setting it to an empty string would emit `color: ;` into the sheet.
      const { result } = renderHook(() => useCssClasses())

      act(() => result.current.removeProp('c1', 'color'))

      expect(Object.hasOwn(persisted()[0].props, 'color')).toBe(false)
    })

    it('leaves other classes alone', () => {
      store.css = [cls('c1', 'a', { color: 'red' }), cls('c2', 'b', {})]
      const { result } = renderHook(() => useCssClasses())

      act(() => result.current.setProp('c1', 'color', 'blue'))

      expect(persisted()[1].props).toEqual({})
    })
  })

  describe('remove', () => {
    it('drops just that class', () => {
      store.css = [cls('c1'), cls('c2')]
      const { result } = renderHook(() => useCssClasses())

      act(() => result.current.remove('c1'))

      expect(persisted().map(c => c.id)).toEqual(['c2'])
    })
  })

  describe('hydrate', () => {
    it('loads the tenant classes once', async () => {
      styleApi.loadStyleClasses.mockResolvedValue([cls('c1')] as never)
      const { result } = renderHook(() => useCssClasses())

      act(() => result.current.hydrate('acme'))
      act(() => result.current.hydrate('acme'))

      await waitFor(() =>
        expect(styleApi.loadStyleClasses).toHaveBeenCalledTimes(1)
      )
    })

    it('loads again for a different tenant', async () => {
      const { result } = renderHook(() => useCssClasses())

      act(() => result.current.hydrate('acme'))
      act(() => result.current.hydrate('other'))

      await waitFor(() =>
        expect(styleApi.loadStyleClasses).toHaveBeenCalledTimes(2)
      )
    })

    it('does not wipe local classes when the tenant has none saved', async () => {
      // Overwriting with an empty list would discard unpublished edits.
      styleApi.loadStyleClasses.mockResolvedValue([])
      const { result } = renderHook(() => useCssClasses())

      act(() => result.current.hydrate('acme'))

      await waitFor(() => expect(styleApi.loadStyleClasses).toHaveBeenCalled())
      expect(persisted()).toBeUndefined()
    })

    it('survives a failed load', async () => {
      styleApi.loadStyleClasses.mockRejectedValue(new Error('offline'))
      const { result } = renderHook(() => useCssClasses())

      act(() => result.current.hydrate('acme'))

      await waitFor(() => expect(styleApi.loadStyleClasses).toHaveBeenCalled())
    })
  })

  describe('publish', () => {
    it('saves the classes and clears the dirty flag', async () => {
      store.css = [cls('c1')]
      const { result } = renderHook(() => useCssClasses())

      let ok = false
      await act(async () => {
        ok = await result.current.publish('acme')
      })

      expect(ok).toBe(true)
      expect(styleApi.saveStyleClasses).toHaveBeenCalledWith(
        expect.anything(),
        'acme',
        [cls('c1')]
      )
      expect(
        store.dispatch.mock.calls.some(c => c[0].type === 'clearDirty')
      ).toBe(true)
    })

    it('keeps the dirty flag when the save is refused', async () => {
      styleApi.saveStyleClasses.mockResolvedValue(false)
      const { result } = renderHook(() => useCssClasses())

      let ok = true
      await act(async () => {
        ok = await result.current.publish()
      })

      expect(ok).toBe(false)
      expect(
        store.dispatch.mock.calls.some(c => c[0].type === 'clearDirty')
      ).toBe(false)
    })

    it('reports false rather than throwing when the save errors', async () => {
      styleApi.saveStyleClasses.mockRejectedValue(new Error('boom'))
      const { result } = renderHook(() => useCssClasses())

      let ok = true
      await act(async () => {
        ok = await result.current.publish()
      })

      expect(ok).toBe(false)
    })

    // The Styles tab calls publish() with no argument, and this used to
    // default to 'system'. So a founder's classes were written to a tenant
    // they do not own, while TenantStyleSheet loads the visited tenant's --
    // the published page rendered unstyled and the shared tenant's sheet
    // was overwritten. BQL passes a tenant explicitly and was unaffected,
    // which is why only the tab was wrong.
    it('publishes under the signed-in tenant when given none', async () => {
      const { result } = renderHook(() => useCssClasses())

      await act(async () => {
        await result.current.publish()
      })

      expect(styleApi.saveStyleClasses).toHaveBeenCalledWith(
        expect.anything(),
        'acme',
        expect.anything()
      )
    })

    it('still lets a caller name the tenant, as BQL does', async () => {
      const { result } = renderHook(() => useCssClasses())

      await act(async () => {
        await result.current.publish('other')
      })

      expect(styleApi.saveStyleClasses).toHaveBeenCalledWith(
        expect.anything(),
        'other',
        expect.anything()
      )
    })
  })

  describe('replace', () => {
    it('swaps in the whole class list', () => {
      store.css = [cls('a')]
      const { result } = renderHook(() => useCssClasses())
      const next = [cls('b'), cls('c')]

      act(() => result.current.replace(next))

      expect(persisted()).toEqual(next)
    })
  })
})

/**
 * publish() has always returned a boolean and the tab has always thrown it
 * away, so a refused publish left the bar reading "Staged changes -- not
 * yet published". That is what it says *before* you press Publish, so the
 * founder reads it as still working and their site keeps serving the CSS
 * it had. The Workflows tab next door already surfaces its reason.
 */
describe('a publish the data layer refused', () => {
  it('says so instead of leaving the bar on "staged changes"', async () => {
    styleApi.saveStyleClasses.mockResolvedValue(false)
    const { result } = renderHook(() => useCssClasses())

    await act(async () => {
      await result.current.publish()
    })

    expect(result.current.error).not.toBeNull()
  })

  it('says so when the data layer cannot be reached at all', async () => {
    styleApi.saveStyleClasses.mockRejectedValue(new Error('ECONNREFUSED'))
    const { result } = renderHook(() => useCssClasses())

    await act(async () => {
      await result.current.publish()
    })

    expect(result.current.error).not.toBeNull()
  })

  it('clears the complaint once a publish goes through', async () => {
    styleApi.saveStyleClasses.mockResolvedValue(false)
    const { result } = renderHook(() => useCssClasses())
    await act(async () => {
      await result.current.publish()
    })
    expect(result.current.error).not.toBeNull()

    styleApi.saveStyleClasses.mockResolvedValue(true)
    await act(async () => {
      await result.current.publish()
    })

    expect(result.current.error).toBeNull()
  })
})

/**
 * Creating a class runs the typed name through toClassName, so "Big red
 * heading" becomes big-red-heading and "2col" becomes s-2col -- a founder
 * should not have to learn that a class cannot hold a space or start with
 * a digit. Renaming did not, and styleSheetText silently drops any name
 * that fails its selector-safety test. So renaming a class to something
 * with a space left it selectable in the builder, saved, published, and
 * rendering nothing at all, with no warning anywhere.
 */
describe('renaming a class to something a selector cannot hold', () => {
  const named = (name: string) => {
    store.css = [cls('c1', 'lede')]
    const { result } = renderHook(() => useCssClasses())
    act(() => {
      result.current.rename('c1', name)
    })
    return persisted().find(c => c.id === 'c1')
  }

  it('turns a spaced name into one that renders', () => {
    expect(named('hero panel')?.name).toBe('hero-panel')
  })

  it('keeps a name that starts with a digit usable', () => {
    expect(named('2col')?.name).toBe('s-2col')
  })

  it('leaves an already-valid name alone', () => {
    expect(named('primary-cta')?.name).toBe('primary-cta')
  })
})
