import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

const auth = vi.hoisted(() => ({
  useAuthContext: vi.fn(() => ({ user: { tenantId: 'acme' } })),
}))
const componentTree = vi.hoisted(() => ({
  useComponentTree: vi.fn(() => ({
    tree: { id: 'root', type: 'container', props: {}, children: [] },
    replaceTree: vi.fn(),
  })),
}))
const cssClasses = vi.hoisted(() => ({
  useCssClasses: vi.fn(() => ({
    classes: [],
    replace: vi.fn(),
  })),
}))
const bqlApply = vi.hoisted(() => ({
  applyBql: vi.fn(),
}))

vi.mock(
  '@/app/_components/auth-provider/auth-provider-component',
  () => auth
)
vi.mock('../builder/use-component-tree', () => componentTree)
vi.mock('../styles/use-css-classes', () => cssClasses)
vi.mock('../builder/bql/apply', () => bqlApply)

import { useBqlTab } from './use-bql-tab'

describe('useBqlTab', () => {
  it('starts with an empty script and no result', () => {
    const { result } = renderHook(() => useBqlTab())
    expect(result.current.script).toBe('')
    expect(result.current.result).toBeNull()
    expect(result.current.running).toBe(false)
  })

  it('runs the script against the current tree and classes', async () => {
    const tree = { id: 'root', type: 'container', props: {}, children: [] }
    componentTree.useComponentTree.mockReturnValue({
      tree,
      replaceTree: vi.fn(),
    })
    bqlApply.applyBql.mockResolvedValue({
      tree,
      classes: [],
      errors: [],
      warnings: [],
    })
    const { result } = renderHook(() => useBqlTab())

    act(() => result.current.setScript('add a Heading 1 that says "Hi"'))
    await act(async () => {
      await result.current.run()
    })

    expect(bqlApply.applyBql).toHaveBeenCalledWith(
      'add a Heading 1 that says "Hi"',
      'acme',
      'root',
      tree,
      []
    )
  })

  it('commits the returned tree and classes when there are no errors', async () => {
    const replaceTree = vi.fn()
    const replaceClasses = vi.fn()
    componentTree.useComponentTree.mockReturnValue({
      tree: { id: 'root', type: 'container', props: {}, children: [] },
      replaceTree,
    })
    cssClasses.useCssClasses.mockReturnValue({
      classes: [],
      replace: replaceClasses,
    })
    const newTree = { id: 'root', type: 'container', props: {}, children: [] }
    const newClasses = [{ id: 'c1', name: 'hero', props: {} }]
    bqlApply.applyBql.mockResolvedValue({
      tree: newTree,
      classes: newClasses,
      errors: [],
      warnings: [],
    })
    const { result } = renderHook(() => useBqlTab())

    await act(async () => {
      await result.current.run()
    })

    expect(replaceTree).toHaveBeenCalledWith(newTree)
    expect(replaceClasses).toHaveBeenCalledWith(newClasses)
  })

  it('does not touch the tree or classes when the script has errors', async () => {
    const replaceTree = vi.fn()
    const replaceClasses = vi.fn()
    componentTree.useComponentTree.mockReturnValue({
      tree: { id: 'root', type: 'container', props: {}, children: [] },
      replaceTree,
    })
    cssClasses.useCssClasses.mockReturnValue({
      classes: [],
      replace: replaceClasses,
    })
    bqlApply.applyBql.mockResolvedValue({
      tree: { id: 'root', type: 'container', props: {}, children: [] },
      classes: [],
      errors: [{ line: 1, message: 'No block called "Frobnicator"' }],
      warnings: [],
    })
    const { result } = renderHook(() => useBqlTab())

    await act(async () => {
      await result.current.run()
    })

    expect(replaceTree).not.toHaveBeenCalled()
    expect(replaceClasses).not.toHaveBeenCalled()
    expect(result.current.result?.errors).toEqual([
      { line: 1, message: 'No block called "Frobnicator"' },
    ])
  })

  it('reports running while the apply is in flight', async () => {
    let resolve: (v: unknown) => void = () => {}
    bqlApply.applyBql.mockReturnValue(
      new Promise(r => {
        resolve = r
      })
    )
    const { result } = renderHook(() => useBqlTab())

    let running = new Promise<void>(() => {})
    act(() => {
      running = result.current.run()
    })
    expect(result.current.running).toBe(true)

    await act(async () => {
      resolve({ tree: {}, classes: [], errors: [], warnings: [] })
      await running
    })
    expect(result.current.running).toBe(false)
  })
})
