import { vi } from 'vitest'
import { render } from '@testing-library/react'
import { ExecutionMonitor, type ExecutionMonitorProps } from './ExecutionMonitor'

export const execution = (id: string, status = 'success') => ({
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

export const refresh = vi.fn()

interface UseWorkflowExecutionsMock {
  useWorkflowExecutions: ReturnType<typeof vi.fn>
}

export function setHook(
  hook: UseWorkflowExecutionsMock,
  over: { executions?: unknown[]; error?: Error | null } = {}
) {
  hook.useWorkflowExecutions.mockReturnValue({
    executions: over.executions ?? [execution('e1')],
    refresh,
    // listError is an Error; the component renders its .message.
    error: over.error ?? null,
  })
}

export function mockFetch(body: unknown, ok = true) {
  const calls: string[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      calls.push(String(url))
      return { ok, status: ok ? 200 : 500, json: () => body } as Response
    })
  )
  return calls
}

type MonitorOverrides = Partial<Omit<ExecutionMonitorProps, 'tenant' | 'workflowId'>>

export const monitor = (props: MonitorOverrides = {}) =>
  render(<ExecutionMonitor tenant="acme" workflowId="wf1" {...props} />)
