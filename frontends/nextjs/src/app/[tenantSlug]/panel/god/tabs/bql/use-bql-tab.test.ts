import { describe, expect, it, vi } from 'vitest'
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

vi.mock('@/app/_components/auth-provider/auth-provider-component', () => auth)
vi.mock('../builder/use-component-tree', () => componentTree)
vi.mock('../styles/use-css-classes', () => cssClasses)
vi.mock('../builder/bql/apply', () => bqlApply)

import { useBqlTab } from './use-bql-tab'

const okResult = {
  tree: { id: 'root', type: 'container', props: {}, children: [] },
  classes: [],
  pages: [],
  errors: [],
  warnings: [],
}

describe('useBqlTab', () => {
  it('starts with one named script', () => {
    const { result } = renderHook(() => useBqlTab())
    expect(result.current.scripts).toHaveLength(1)
    expect(result.current.scripts[0].name).toBe('Page content')
    expect(result.current.scripts[0].text).toBe('')
  })

  it('adds another script without touching the first', () => {
    const { result } = renderHook(() => useBqlTab())
    act(() => {
      result.current.patch(result.current.scripts[0].id, {
        text: 'add a Heading 1',
      })
    })
    act(() => result.current.add())

    expect(result.current.scripts).toHaveLength(2)
    expect(result.current.scripts[0].text).toBe('add a Heading 1')
    expect(result.current.scripts[1].text).toBe('')
  })

  it('renames only the script asked for', () => {
    const { result } = renderHook(() => useBqlTab())
    act(() => result.current.add())
    const second = result.current.scripts[1].id
    act(() => {
      result.current.patch(second, { name: 'Routes' })
    })

    expect(result.current.scripts[1].name).toBe('Routes')
    expect(result.current.scripts[0].name).toBe('Page content')
  })

  it('keeps the last script rather than leaving nothing to type into', () => {
    const { result } = renderHook(() => useBqlTab())
    act(() => {
      result.current.remove(result.current.scripts[0].id)
    })
    expect(result.current.scripts).toHaveLength(1)
  })

  it('removes the script asked for when there is more than one', () => {
    const { result } = renderHook(() => useBqlTab())
    act(() => result.current.add())
    const first = result.current.scripts[0].id
    act(() => {
      result.current.remove(first)
    })

    expect(result.current.scripts).toHaveLength(1)
    expect(result.current.scripts[0].id).not.toBe(first)
  })

  it('runs only the script asked for, and keeps its result under its own id', async () => {
    bqlApply.applyBql.mockResolvedValue(okResult)
    const { result } = renderHook(() => useBqlTab())
    act(() => result.current.add())
    const second = result.current.scripts[1].id
    act(() => {
      result.current.patch(second, { text: 'add a Paragraph' })
    })

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

    it('records which routes took, so a refusal is visible', async () => {
      const publish = setup([{ line: 1, title: 'About', path: '/about' }])
      publish.mockResolvedValue(false)
      const { result } = renderHook(() => useBqlTab())

      await runFirst(result)

      const id = result.current.scripts[0].id
      expect(result.current.published[id]).toEqual([
        { path: '/about', ok: false },
      ])
    })

    it('publishes nothing when the script asked for no route', async () => {
      const publish = setup([])
      const { result } = renderHook(() => useBqlTab())

      await runFirst(result)

      expect(publish).not.toHaveBeenCalled()
    })
  })
})
