import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'

// The selection callback and detail-fetch failure modes -- split out of
// ExecutionMonitor.select.test.tsx to stay under the 80-line file limit.

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

describe('ExecutionMonitor selection resilience', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setHook(hook)
    mockFetch(execution('e1'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => vi.unstubAllGlobals())

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
