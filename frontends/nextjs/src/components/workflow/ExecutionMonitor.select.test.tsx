import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'

// Selecting an execution and loading its details -- split out of
// ExecutionMonitor.test.tsx (which covers the list itself) to stay under
// the 80-line file limit.

const hook = vi.hoisted(() => ({ useWorkflowExecutions: vi.fn() }))
vi.mock('@metabuilder/hooks', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, useWorkflowExecutions: hook.useWorkflowExecutions }
})

import {
  execution,
  setHook,
  mockFetch,
  monitor,
} from './execution-monitor-test-helpers'

describe('ExecutionMonitor selecting an execution', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setHook(hook)
    mockFetch(execution('e1'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => vi.unstubAllGlobals())

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
})
