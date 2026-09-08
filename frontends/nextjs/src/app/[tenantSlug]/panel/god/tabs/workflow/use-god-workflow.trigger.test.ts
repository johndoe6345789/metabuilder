import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

vi.mock('../use-current-tenant-scope', () => ({
  useCurrentTenantScope: () => ({ tenant: 'acme', canPickOtherTenant: false }),
}))

const graph = vi.hoisted(() => ({ saveGraph: vi.fn(async () => true) }))
vi.mock('@/lib/workflow/workflow-graph', () => graph)
vi.mock('@/lib/persist/versions', () => ({ snapshot: vi.fn(async () => true) }))

/** A real per-tenant store, so the reducers are exercised not stubbed. */
const store = vi.hoisted(() => ({
  workflows: {} as Record<string, unknown[]>,
  selected: {} as Record<string, string>,
  dirty: true,
}))

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => (a: { type: string; payload: never }) => {
    const p = a.payload as unknown as {
      tenant: string
      entries?: unknown[]
      id?: string
      change?: Record<string, unknown>
    }
    const list = (store.workflows[p.tenant] ?? []) as {
      workflow: { id: string }
    }[]
    if (a.type === 'setWorkflows') store.workflows[p.tenant] = p.entries ?? []
    if (a.type === 'patchWorkflow') {
      store.workflows[p.tenant] = list.map(e =>
        e.workflow.id === p.id ? { ...e, ...p.change } : e
      )
    }
  },
  useAppSelector: (fn: (s: unknown) => unknown) =>
    fn({
      god: {
        workflows: store.workflows,
        workflowSelected: store.selected,
        dirty: { workflow: store.dirty },
      },
    }),
}))
vi.mock('@/store/slices/god-slice', () => ({
  setWorkflows: (p: unknown) => ({ type: 'setWorkflows', payload: p }),
  addWorkflow: (p: unknown) => ({ type: 'addWorkflow', payload: p }),
  patchWorkflow: (p: unknown) => ({ type: 'patchWorkflow', payload: p }),
  removeWorkflow: (p: unknown) => ({ type: 'removeWorkflow', payload: p }),
  selectWorkflow: (p: unknown) => ({ type: 'selectWorkflow', payload: p }),
  clearDirty: (p: unknown) => ({ type: 'clearDirty', payload: p }),
  // Publishing clears only the workflow that was published; the shared
  // dirty flag reported every other one as up to date too.
  workflowPublished: (p: unknown) => ({
    type: 'workflowPublished',
    payload: p,
  }),
}))

import { useGodWorkflow } from './use-god-workflow'

interface SentRequest {
  url: string
  method: string
  body: Record<string, unknown>
}
const sent: SentRequest[] = []
const stubDbal = (postStatus: number) => {
  sent.length = 0
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit) => {
      sent.push({
        url,
        method: String(init.method),
        body: JSON.parse(String(init.body)) as Record<string, unknown>,
      })
      const status = init.method === 'POST' ? postStatus : 200
      return { ok: status >= 200 && status < 300, status }
    })
  )
}

beforeEach(() => {
  store.workflows = {}
  store.selected = {}
  vi.clearAllMocks()
})

describe('what makes a workflow run', () => {
  it('publishes the trigger the founder chose', async () => {
    stubDbal(201)
    const { result, rerender } = renderHook(() => useGodWorkflow())

    act(() => {
      result.current.setTrigger('FormSubmission.created')
    })
    // The stand-in store does not notify, so the read has to be re-run.
    rerender()
    await act(async () => {
      await result.current.publish()
    })

    expect(sent[0]?.body.triggerEvent).toBe('FormSubmission.created')
  })

  // Nothing runs a draft, and DBAL will not let a page name one either.
  it('marks the workflow published', async () => {
    stubDbal(201)
    const { result } = renderHook(() => useGodWorkflow())

    await act(async () => {
      await result.current.publish()
    })

    expect(sent[0]?.body.isPublished).toBe(true)
  })

  /**
   * From the second publish onwards the row already exists and DBAL
   * answers 409. That used to be shrugged off so the graph could still be
   * written -- which would mean changing what a workflow runs on never
   * took effect, silently.
   */
  it('updates the row when it is already there', async () => {
    stubDbal(409)
    const { result, rerender } = renderHook(() => useGodWorkflow())

    act(() => {
      result.current.setTrigger('FormSubmission.created')
    })
    rerender()
    const ok = await act(async () => result.current.publish())

    const put = sent.find(r => r.method === 'PUT')
    expect(put?.url).toContain('/core/Workflow/')
    expect(put?.body.triggerEvent).toBe('FormSubmission.created')
    expect(ok).toBe(true)
  })

  it('still writes the graph after updating the row', async () => {
    stubDbal(409)
    const { result } = renderHook(() => useGodWorkflow())

    await act(async () => {
      await result.current.publish()
    })

    expect(graph.saveGraph).toHaveBeenCalled()
  })

  // Each workflow is its own row, so publishing one cannot overwrite
  // another -- which a single fixed id would have done.
  it('publishes each workflow under its own id', async () => {
    stubDbal(201)
    const { result, rerender } = renderHook(() => useGodWorkflow())
    const firstId = result.current.selectedId

    await act(async () => {
      await result.current.publish()
    })
    rerender()

    expect(sent[0]?.body.id).toBe(firstId)
  })
})

/**
 * Publishing a workflow had never once worked: the schema requires
 * `version` and the payload never sent one, so DBAL answered 422 "Field
 * is required" -- and the tab discarded the result, leaving the status on
 * "Staged changes" with nothing said. Found by publishing one and asking
 * the data layer what it held: nothing.
 */
describe('a publish that is refused', () => {
  it('sends the version the schema requires', async () => {
    stubDbal(201)
    const { result } = renderHook(() => useGodWorkflow())

    await act(async () => {
      await result.current.publish()
    })

    expect(sent[0]?.body.version).toBe(1)
  })

  it('reports why, rather than looking unsaved for no reason', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 422,
        text: async () =>
          JSON.stringify({
            fields: [{ field: 'version', message: 'Field is required' }],
          }),
      }))
    )
    const { result } = renderHook(() => useGodWorkflow())

    await act(async () => {
      await result.current.publish()
    })

    expect(result.current.error).toContain('version')
    expect(result.current.error).toContain('422')
  })

  it('has no error to report after a publish that worked', async () => {
    stubDbal(201)
    const { result } = renderHook(() => useGodWorkflow())

    await act(async () => {
      await result.current.publish()
    })

    expect(result.current.error).toBeNull()
  })
})

/**
 * Three workflows all subscribed to FormSubmission.created each claimed
 * every submission, and which one ran came down to whichever row the
 * database returned first. A workflow says which form it answers.
 */
describe('which form a workflow answers', () => {
  it('publishes the form the workflow was scoped to', async () => {
    stubDbal(201)
    const { result, rerender } = renderHook(() => useGodWorkflow())

    act(() => {
      result.current.setFormName('book-a-repair')
    })
    rerender()
    await act(async () => {
      await result.current.publish()
    })

    expect(sent[0]?.body.formName).toBe('book-a-repair')
  })

  // Naming no form still means any of them, as it always has.
  it('publishes an empty form when none was chosen', async () => {
    stubDbal(201)
    const { result } = renderHook(() => useGodWorkflow())

    await act(async () => {
      await result.current.publish()
    })

    expect(sent[0]?.body.formName).toBe('')
  })
})
