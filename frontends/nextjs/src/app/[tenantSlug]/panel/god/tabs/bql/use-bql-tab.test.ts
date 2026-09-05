import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

const auth = vi.hoisted(() => ({
  useAuthContext: vi.fn(() => ({ user: { tenantId: 'acme' } })),
}))
const componentTree = vi.hoisted(() => ({
  useComponentTree: vi.fn(() => ({
    tree: { id: 'root', type: 'container', props: {}, children: [] },
    replaceTree: vi.fn(),
    publish: vi.fn(async () => true),
  })),
}))
const cssClasses = vi.hoisted(() => ({
  useCssClasses: vi.fn(() => ({ classes: [], replace: vi.fn() })),
}))
const bqlApply = vi.hoisted(() => ({ applyBql: vi.fn() }))
/** A real per-tenant store, so persistence is exercised not stubbed. */
const store = vi.hoisted(() => ({ bql: {} as Record<string, unknown[]> }))

vi.mock('@/app/_components/auth-provider/auth-provider-component', () => auth)
vi.mock('../builder/use-component-tree', () => componentTree)
vi.mock('../styles/use-css-classes', () => cssClasses)
vi.mock('../builder/bql/apply', () => bqlApply)
vi.mock('@/store/hooks', () => ({
  // A stand-in for the real reducers, so the tests exercise store-backed
  // behaviour (including that two edits in one tick both survive).
  useAppDispatch: () => (action: { type: string; payload: never }) => {
    const p = action.payload as unknown as {
      tenant: string
      scripts?: { id: string }[]
      script?: { id: string }
      id?: string
      change?: Record<string, unknown>
    }
    store.bql ??= {}
    const list = store.bql[p.tenant] ?? []
    if (action.type === 'setBql') store.bql[p.tenant] = p.scripts ?? []
    if (action.type === 'addBqlScript') {
      store.bql[p.tenant] = [...list, p.script as { id: string }]
    }
    if (action.type === 'patchBqlScript') {
      store.bql[p.tenant] = list.map(x =>
        (x as { id: string }).id === p.id ? { ...x, ...p.change } : x
      )
    }
    if (action.type === 'removeBqlScript' && list.length > 1) {
      store.bql[p.tenant] = list.filter(x => (x as { id: string }).id !== p.id)
    }
  },
  useAppSelector: (fn: (s: unknown) => unknown) => fn({ god: store }),
}))
vi.mock('@/store/slices/god-slice', () => ({
  setBql: (payload: unknown) => ({ type: 'setBql', payload }),
  addBqlScript: (payload: unknown) => ({ type: 'addBqlScript', payload }),
  patchBqlScript: (payload: unknown) => ({ type: 'patchBqlScript', payload }),
  removeBqlScript: (payload: unknown) => ({ type: 'removeBqlScript', payload }),
}))

import { useBqlTab } from './use-bql-tab'

const okResult = {
  tree: { id: 'root', type: 'container', props: {}, children: [] },
  classes: [],
  pages: [],
  errors: [],
  warnings: [],
}

beforeEach(() => {
  store.bql = {}
})

describe('useBqlTab', () => {
  it('starts with one named script', () => {
    const { result } = renderHook(() => useBqlTab())
    expect(result.current.scripts).toHaveLength(1)
    expect(result.current.scripts[0].name).toBe('Page content')
    expect(result.current.scripts[0].text).toBe('')
  })

  it('adds another script without touching the first', () => {
    const { result, rerender } = renderHook(() => useBqlTab())
    act(() => {
      result.current.patch(result.current.scripts[0].id, {
        text: 'add a Heading 1',
      })
    })
    act(() => result.current.add())
    rerender()

    expect(result.current.scripts).toHaveLength(2)
    expect(result.current.scripts[0].text).toBe('add a Heading 1')
    expect(result.current.scripts[1].text).toBe('')
  })

  it('renames only the script asked for', () => {
    const { result, rerender } = renderHook(() => useBqlTab())
    act(() => result.current.add())
    rerender()
    const second = result.current.scripts[1].id
    act(() => {
      result.current.patch(second, { name: 'Routes' })
    })
    rerender()

    expect(result.current.scripts[1].name).toBe('Routes')
    expect(result.current.scripts[0].name).toBe('Page content')
  })

  it('keeps the last script rather than leaving nothing to type into', () => {
    const { result, rerender } = renderHook(() => useBqlTab())
    act(() => {
      result.current.remove(result.current.scripts[0].id)
    })
    rerender()
    expect(result.current.scripts).toHaveLength(1)
  })

  it('removes the script asked for when there is more than one', () => {
    const { result, rerender } = renderHook(() => useBqlTab())
    act(() => result.current.add())
    rerender()
    const first = result.current.scripts[0].id
    act(() => {
      result.current.remove(first)
    })
    rerender()

    expect(result.current.scripts).toHaveLength(1)
    expect(result.current.scripts[0].id).not.toBe(first)
  })

  it('runs only the script asked for, and keeps its result under its own id', async () => {
    bqlApply.applyBql.mockResolvedValue(okResult)
    const { result, rerender } = renderHook(() => useBqlTab())
    act(() => result.current.add())
    rerender()
    const second = result.current.scripts[1].id
    act(() => {
      result.current.patch(second, { text: 'add a Paragraph' })
    })
    rerender()

    await act(async () => {
      await result.current.run(second)
    })

    expect(bqlApply.applyBql).toHaveBeenCalledWith(
      'add a Paragraph',
      'acme',
      'root',
      expect.anything(),
      []
    )
    expect(result.current.results[second]).toEqual(okResult)
    expect(result.current.results[result.current.scripts[0].id]).toBeUndefined()
  })

  it('leaves the tree alone when a script has errors', async () => {
    const replaceTree = vi.fn()
    componentTree.useComponentTree.mockReturnValue({
      tree: { id: 'root', type: 'container', props: {}, children: [] },
      replaceTree,
      publish: vi.fn(async () => true),
    })
    bqlApply.applyBql.mockResolvedValue({
      ...okResult,
      errors: [{ line: 1, message: 'No block called "Frobnicator"' }],
    })
    const { result } = renderHook(() => useBqlTab())
    act(() => {
      result.current.patch(result.current.scripts[0].id, { text: 'nonsense' })
    })

    await act(async () => {
      await result.current.run(result.current.scripts[0].id)
    })

    expect(replaceTree).not.toHaveBeenCalled()
    const own = result.current.results[result.current.scripts[0].id]
    expect(own?.errors).toHaveLength(1)
  })

  describe('a script that says where its page goes', () => {
    const built = { id: 'root', type: 'container', props: {}, children: [] }

    const setup = (pages: unknown[]) => {
      const publish = vi.fn(async () => true)
      componentTree.useComponentTree.mockReturnValue({
        tree: { id: 'root', type: 'container', props: {}, children: [] },
        replaceTree: vi.fn(),
        publish,
      })
      bqlApply.applyBql.mockResolvedValue({ ...okResult, tree: built, pages })
      return publish
    }

    const runFirst = async (
      result: { current: ReturnType<typeof useBqlTab> },
      text = 'add a Heading 1'
    ) => {
      act(() => {
        result.current.patch(result.current.scripts[0].id, { text })
      })
      await act(async () => {
        await result.current.run(result.current.scripts[0].id)
      })
    }

    it('publishes the tree it just built, not the one Redux still holds', async () => {
      const publish = setup([{ line: 2, title: 'About', path: '/about' }])
      const { result } = renderHook(() => useBqlTab())

      await runFirst(result)

      expect(publish).toHaveBeenCalledWith(
        {
          tenant: 'acme',
          path: '/about',
          title: 'About',
          level: 0,
          requiresAuth: false,
        },
        built
      )
    })

    it('titles the page after its path when the sentence gave no title', async () => {
      const publish = setup([{ line: 1, path: '/contact' }])
      const { result } = renderHook(() => useBqlTab())

      await runFirst(result)

      expect(publish).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/contact', title: '/contact' }),
        built
      )
    })

    it("records the server's reason, so a refusal explains itself", async () => {
      const publish = setup([{ line: 1, title: 'About', path: '/about' }])
      publish.mockResolvedValue('PageTree rejected (429)')
      const { result } = renderHook(() => useBqlTab())

      await runFirst(result)

      const id = result.current.scripts[0].id
      expect(result.current.published[id]).toEqual([
        { path: '/about', reason: 'PageTree rejected (429)' },
      ])
    })

    it('publishes nothing when the script asked for no route', async () => {
      const publish = setup([])
      const { result } = renderHook(() => useBqlTab())

      await runFirst(result)

      expect(publish).not.toHaveBeenCalled()
    })
  })

  describe('keeping scripts', () => {
    it('finds the scripts still there after the tab is left and re-entered', () => {
      const first = renderHook(() => useBqlTab())
      act(() => {
        first.result.current.patch(first.result.current.scripts[0].id, {
          name: 'Routes',
          text: 'publish this at /about',
        })
      })
      first.unmount()

      // A fresh mount is what switching God Panel tabs does.
      const { result } = renderHook(() => useBqlTab())

      expect(result.current.scripts[0].name).toBe('Routes')
      expect(result.current.scripts[0].text).toBe('publish this at /about')
    })

    it("never shows one tenant's scripts to another", () => {
      const acme = renderHook(() => useBqlTab())
      act(() => {
        acme.result.current.patch(acme.result.current.scripts[0].id, {
          text: 'publish this at /acme-only',
        })
      })
      acme.unmount()

      auth.useAuthContext.mockReturnValue({ user: { tenantId: 'globex' } })
      const { result } = renderHook(() => useBqlTab())

      expect(result.current.scripts[0].text).toBe('')
      expect(store.bql.acme).toHaveLength(1)
      auth.useAuthContext.mockReturnValue({ user: { tenantId: 'acme' } })
    })
  })

  describe('a store saved before scripts existed', () => {
    /**
     * redux-persist replaces the whole god slice with what it saved, so a
     * browser that last used this app before `bql` existed rehydrates a
     * slice with no `bql` key at all -- and reading bql[tenant] off
     * undefined took the entire tab down with "Cannot read properties of
     * undefined". Every existing install is in exactly that state on the
     * first load after this ships.
     */
    it('opens on a slice that has no bql key at all', () => {
      // @ts-expect-error -- modelling a slice persisted before this key.
      delete store.bql

      const { result } = renderHook(() => useBqlTab())

      expect(result.current.scripts).toHaveLength(1)
      expect(result.current.scripts[0].name).toBe('Page content')
    })

    it('can still be typed into once seeded from such a slice', () => {
      // @ts-expect-error -- modelling a slice persisted before this key.
      delete store.bql
      const { result, rerender } = renderHook(() => useBqlTab())

      act(() => {
        result.current.patch(result.current.scripts[0].id, { text: 'add a Box' })
      })
      rerender()

      expect(result.current.scripts[0].text).toBe('add a Box')
    })
  })
})

