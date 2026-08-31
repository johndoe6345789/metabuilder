import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'

const hook = vi.hoisted(() => ({ useWorkflowExecutions: vi.fn() }))
vi.mock('@metabuilder/hooks', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, useWorkflowExecutions: hook.useWorkflowExecutions }
})

import {
  execution,
  refresh,
  setHook,
  mockFetch,
  monitor,
} from './execution-monitor-test-helpers'

describe('ExecutionMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setHook(hook)
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
      setHook(hook, { executions: [] })

      monitor()

      expect(screen.getByText('No executions yet')).toBeTruthy()
    })

    it('surfaces a list error', () => {
      setHook(hook, { error: new Error('DBAL unreachable') })

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
})
