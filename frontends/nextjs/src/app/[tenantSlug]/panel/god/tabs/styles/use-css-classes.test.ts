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

    it('defaults to the system tenant', async () => {
      const { result } = renderHook(() => useCssClasses())

      await act(async () => {
        await result.current.publish()
      })

      expect(styleApi.saveStyleClasses).toHaveBeenCalledWith(
        expect.anything(),
        'system',
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
