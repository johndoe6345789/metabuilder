import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

const godTenant = vi.hoisted(() => ({
  useGodTenant: vi.fn(() => ({ tenant: 'acme', known: true, foreign: false })),
}))
vi.mock('../use-god-tenant', () => godTenant)

const graph = vi.hoisted(() => ({ saveGraph: vi.fn(async () => true) }))
vi.mock('@/lib/workflow/workflow-graph', () => graph)
vi.mock('@/lib/persist/versions', () => ({ snapshot: vi.fn(async () => true) }))

const store = vi.hoisted(() => ({
  workflow: {
    id: 'wf_1',
    name: 'Tell me about a booking',
    description: '',
    nodes: [],
    connections: [],
  },
  trigger: '',
  dirty: true,
}))
vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => (a: { type: string; payload: unknown }) => {
    if (a.type === 'setWorkflowTrigger') store.trigger = a.payload as string
  },
  useAppSelector: (fn: (s: unknown) => unknown) =>
    fn({
      god: {
        workflow: store.workflow,
        workflowTrigger: store.trigger,
        dirty: { workflow: store.dirty },
      },
    }),
}))
vi.mock('@/store/slices/god-slice', () => ({
  setWorkflow: (p: unknown) => ({ type: 'setWorkflow', payload: p }),
  setWorkflowTrigger: (p: unknown) => ({
    type: 'setWorkflowTrigger',
    payload: p,
  }),
  clearDirty: (p: unknown) => ({ type: 'clearDirty', payload: p }),
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
  store.trigger = ''
  vi.clearAllMocks()
})

describe('what makes a workflow run', () => {
  it('publishes the trigger the founder chose', async () => {
    stubDbal(201)
    const { result, rerender } = renderHook(() => useGodWorkflow('acme'))

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

  // Nothing runs a draft, so publishing has to say it is published.
  it('marks the workflow published', async () => {
    stubDbal(201)
    const { result } = renderHook(() => useGodWorkflow('acme'))

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
    const { result, rerender } = renderHook(() => useGodWorkflow('acme'))

    act(() => {
      result.current.setTrigger('FormSubmission.created')
    })
    rerender()
    const ok = await act(async () => result.current.publish())

    const put = sent.find(r => r.method === 'PUT')
    expect(put?.url).toContain('/core/Workflow/wf_1')
    expect(put?.body.triggerEvent).toBe('FormSubmission.created')
    expect(ok).toBe(true)
  })

  it('still writes the graph after updating the row', async () => {
    stubDbal(409)
    const { result } = renderHook(() => useGodWorkflow('acme'))

    await act(async () => {
      await result.current.publish()
    })

    expect(graph.saveGraph).toHaveBeenCalled()
  })
})
