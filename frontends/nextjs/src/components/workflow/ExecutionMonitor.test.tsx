import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

const hook = vi.hoisted(() => ({ useWorkflowExecutions: vi.fn() }))
vi.mock('@metabuilder/hooks', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, useWorkflowExecutions: hook.useWorkflowExecutions }
})

import { ExecutionMonitor } from './ExecutionMonitor'

const execution = (id: string, status = 'success') => ({
  id,
  workflowId: 'wf1',
  tenantId: 'acme',
  status,
  state: { nodes: {} },
  // The component reads execution.metrics.nodesExecuted with no guard, so
  // an execution without metrics takes the whole list down.
  metrics: { nodesExecuted: 3, durationMs: 5000 },
  logs: [],
  startedAt: '2026-01-01T00:00:00.000Z',
  completedAt: '2026-01-01T00:00:05.000Z',
  startTime: new Date('2026-01-01T00:00:00.000Z'),
  duration: 5000,
})

const refresh = vi.fn()

function setHook(over: { executions?: unknown[]; error?: Error | null } = {}) {
  hook.useWorkflowExecutions.mockReturnValue({
    executions: over.executions ?? [execution('e1')],
    refresh,
    // listError is an Error; the component renders its .message.
    error: over.error ?? null,
  })
}

function mockFetch(body: unknown, ok = true) {
  const calls: string[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      calls.push(String(url))
      return { ok, status: ok ? 200 : 500, json: async () => body } as Response
    })
  )
  return calls
}

const monitor = (props: Record<string, unknown> = {}) =>
  render(
    <ExecutionMonitor tenant="acme" workflowId="wf1" {...(props as never)} />
  )

describe('ExecutionMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setHook()
    mockFetch(execution('e1'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => vi.unstubAllGlobals())

  describe('the execution list', () => {
    it('lists the executions it was given', () => {
      monitor()

      expect(screen.getByText(/Execution History/)).toBeTruthy()
      expect(screen.getByText(/SUCCESS/)).toBeTruthy()
    })

    it('says so when there are none', () => {
      setHook({ executions: [] })

      monitor()

      expect(screen.getByText('No executions yet')).toBeTruthy()
    })

    it('surfaces a list error', () => {
      setHook({ error: new Error('DBAL unreachable') })

      monitor()

      expect(screen.getByText(/DBAL unreachable/)).toBeTruthy()
    })

    it('refreshes on demand', () => {
      monitor()

      fireEvent.click(screen.getByRole('button', { name: /Refresh/ }))

      expect(refresh).toHaveBeenCalled()
    })

    it('asks the hook for the tenant and workflow given', () => {
      monitor()

      expect(hook.useWorkflowExecutions).toHaveBeenCalledWith(
        'acme',
        'wf1',
        expect.objectContaining({ autoRefresh: true })
      )
    })
  })

  describe('selecting an execution', () => {
    it('shows a prompt until one is chosen', () => {
      monitor()

      expect(screen.getByText(/Select an execution/i)).toBeTruthy()
    })

    it('loads the details for a preselected execution', async () => {
      const calls = mockFetch(execution('e9'))

      monitor({ executionId: 'e9' })

      await waitFor(() => {
        expect(calls.some(c => c.includes('/executions/e9'))).toBe(true)
      })
    })

    it('scopes the details request to the tenant', async () => {
      const calls = mockFetch(execution('e9'))

      monitor({ executionId: 'e9' })

      await waitFor(() => expect(calls.length).toBeGreaterThan(0))
      expect(calls[0]).toContain('/api/v1/acme/workflows/')
    })

    it('does not fetch when nothing is selected', () => {
      const calls = mockFetch(execution('e1'))

      monitor()

      expect(calls).toHaveLength(0)
    })

    it('tells the caller which execution was picked', () => {
      const onExecutionSelect = vi.fn()
      monitor({ onExecutionSelect })

      fireEvent.click(screen.getByText(/SUCCESS/))

      expect(onExecutionSelect).toHaveBeenCalledWith('e1')
    })

    it('survives a failed details fetch', async () => {
      mockFetch({}, false)

      monitor({ executionId: 'e9' })

      // No detail panel, but the list is still usable.
      await waitFor(() => {
        expect(screen.getByText(/Execution History/)).toBeTruthy()
      })
    })

    it('survives a details fetch that throws', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => {
          throw new Error('offline')
        })
      )

      monitor({ executionId: 'e9' })

      await waitFor(() => {
        expect(screen.getByText(/Execution History/)).toBeTruthy()
      })
    })
  })
})
