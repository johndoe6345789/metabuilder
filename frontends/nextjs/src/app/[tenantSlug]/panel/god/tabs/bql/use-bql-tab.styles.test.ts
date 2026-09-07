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
const store = vi.hoisted(() => ({ bql: {} as Record<string, unknown[]> }))

vi.mock('@/app/_components/auth-provider/auth-provider-component', () => auth)
vi.mock('../builder/use-component-tree', () => componentTree)
vi.mock('../styles/use-css-classes', () => cssClasses)
vi.mock('../builder/bql/apply', () => bqlApply)
vi.mock('../workflow/use-god-workflow', () => ({
  useGodWorkflow: () => ({ saveFromScript: vi.fn(async () => null) }),
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

const made = [{ id: 'c1', name: 'hours-line', props: { color: '#1f2937' } }]

const outcome = (over: Record<string, unknown> = {}) => ({
  tree: { id: 'root', type: 'container', props: {}, children: [] },
  classes: made,
  pages: [{ line: 9, path: '/actions', title: 'Actions' }],
  errors: [],
  warnings: [],
  ...over,
})

beforeEach(() => {
  store.bql = {}
  vi.clearAllMocks()
})

const runFirst = async (r: { current: ReturnType<typeof useBqlTab> }) => {
  act(() => {
    r.current.patch(r.current.scripts[0].id, { text: 'irrelevant' })
  })
  await act(async () => {
    await r.current.run(r.current.scripts[0].id)
  })
}

/**
 * A script that makes styles and publishes a page put the page live and
 * left the styles in the editor: the classes were applied to the blocks,
 * no StyleRule row was written, and the published page rendered with the
 * class names on it and no rules behind them. Half a publish, and the
 * half that shows is the wrong one.
 */
describe('a script that styles the page it publishes', () => {
  it('publishes the styles it made', async () => {
    const publishStyles = vi.fn(async () => true)
    cssClasses.useCssClasses.mockReturnValue({
      classes: [],
      replace: vi.fn(),
      publish: publishStyles,
    })
    bqlApply.applyBql.mockResolvedValue(outcome())
    const { result } = renderHook(() => useBqlTab())

    await runFirst(result)

    expect(publishStyles).toHaveBeenCalledWith('acme', made)
  })

  it('leaves the styles alone when nothing is published', async () => {
    const publishStyles = vi.fn(async () => true)
    cssClasses.useCssClasses.mockReturnValue({
      classes: [],
      replace: vi.fn(),
      publish: publishStyles,
    })
    bqlApply.applyBql.mockResolvedValue(outcome({ pages: [] }))
    const { result } = renderHook(() => useBqlTab())

    await runFirst(result)

    expect(publishStyles).not.toHaveBeenCalled()
  })
})
