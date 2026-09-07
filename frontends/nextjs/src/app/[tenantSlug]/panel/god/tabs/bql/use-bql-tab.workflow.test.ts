import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

const auth = vi.hoisted(() => ({
  useAuthContext: vi.fn(() => ({ user: { tenantId: 'acme' } })),
}))
const componentTree = vi.hoisted(() => ({
  useComponentTree: vi.fn(() => ({
    tree: { id: 'root', type: 'container', props: {}, children: [] },
    replaceTree: vi.fn(),
    publish: vi.fn(async () => null),
  })),
}))
const cssClasses = vi.hoisted(() => ({
  useCssClasses: vi.fn(() => ({
    classes: [],
    replace: vi.fn(),
    publish: vi.fn(async () => true),
  })),
}))
const bqlApply = vi.hoisted(() => ({ applyBql: vi.fn() }))
const godWorkflow = vi.hoisted(() => ({
  saveFromScript: vi.fn(async () => null),
}))
const store = vi.hoisted(() => ({ bql: {} as Record<string, unknown[]> }))

vi.mock('@/app/_components/auth-provider/auth-provider-component', () => auth)
vi.mock('../builder/use-component-tree', () => componentTree)
vi.mock('../styles/use-css-classes', () => cssClasses)
vi.mock('../builder/bql/apply', () => bqlApply)
vi.mock('../workflow/use-god-workflow', () => ({
  useGodWorkflow: () => godWorkflow,
}))
vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => (a: { type: string; payload: never }) => {
    const p = a.payload as unknown as { tenant: string; scripts?: unknown[] }
    store.bql ??= {}
    if (a.type === 'setBql') store.bql[p.tenant] = p.scripts ?? []
  },
  useAppSelector: (fn: (s: unknown) => unknown) => fn({ god: store }),
}))
vi.mock('@/store/slices/god-slice', () => ({
  setBql: (p: unknown) => ({ type: 'setBql', payload: p }),
  addBqlScript: (p: unknown) => ({ type: 'addBqlScript', payload: p }),
  patchBqlScript: (p: unknown) => ({ type: 'patchBqlScript', payload: p }),
  removeBqlScript: (p: unknown) => ({ type: 'removeBqlScript', payload: p }),
}))

import { useBqlTab } from './use-bql-tab'

const built = {
  name: 'Log a repair booking',
  trigger: 'FormSubmission.created',
  formName: 'book-a-repair',
  nodes: [],
  publish: true,
}

beforeEach(() => {
  store.bql = {}
  vi.clearAllMocks()
  godWorkflow.saveFromScript.mockResolvedValue(null)
})

const runScript = async (result: { current: ReturnType<typeof useBqlTab> }) => {
  act(() => {
    result.current.patch(result.current.scripts[0].id, { text: 'irrelevant' })
  })
  await act(async () => {
    await result.current.run(result.current.scripts[0].id)
  })
}

/**
 * A script builds a page or a workflow. The workflow half was built and
 * then reached by nothing -- the applier existed, and the tab still sent
 * every script down the page path.
 */
describe('a script that describes a workflow', () => {
  it('goes to the workflow, not to the page', async () => {
    const replaceTree = vi.fn()
    componentTree.useComponentTree.mockReturnValue({
      tree: { id: 'root', type: 'container', props: {}, children: [] },
      replaceTree,
      publish: vi.fn(async () => null),
    })
    bqlApply.applyBql.mockResolvedValue({
      tree: { id: 'root', type: 'container', props: {}, children: [] },
      classes: [],
      pages: [],
      errors: [],
      warnings: [],
      workflow: built,
    })
    const { result } = renderHook(() => useBqlTab())

    await runScript(result)

    expect(godWorkflow.saveFromScript).toHaveBeenCalledWith(built)
    // The page is not touched: this script was never about one.
    expect(replaceTree).not.toHaveBeenCalled()
  })

  it('reports why the workflow could not be saved', async () => {
    bqlApply.applyBql.mockResolvedValue({
      tree: { id: 'root', type: 'container', props: {}, children: [] },
      classes: [],
      pages: [],
      errors: [],
      warnings: [],
      workflow: built,
    })
    godWorkflow.saveFromScript.mockResolvedValue('Workflow rejected (422)')
    const { result } = renderHook(() => useBqlTab())

    await runScript(result)

    const own = result.current.results[result.current.scripts[0].id]
    expect(own?.errors[0]?.message).toContain('422')
  })

  it('leaves a page script alone', async () => {
    const replaceTree = vi.fn()
    componentTree.useComponentTree.mockReturnValue({
      tree: { id: 'root', type: 'container', props: {}, children: [] },
      replaceTree,
      publish: vi.fn(async () => null),
    })
    bqlApply.applyBql.mockResolvedValue({
      tree: { id: 'root', type: 'container', props: {}, children: [] },
      classes: [],
      pages: [],
      errors: [],
      warnings: [],
    })
    const { result } = renderHook(() => useBqlTab())

    await runScript(result)

    expect(godWorkflow.saveFromScript).not.toHaveBeenCalled()
    expect(replaceTree).toHaveBeenCalled()
  })
})
