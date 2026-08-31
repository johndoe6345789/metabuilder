import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { setup, focusInput } from './search-select-test-helpers'

describe('SearchSelect', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('opening', () => {
    it('browses without a query rather than showing nothing', async () => {
      const { calls } = setup()

      focusInput()

      await waitFor(() => expect(calls.length).toBeGreaterThan(0))
      // The empty-query case must not hit _search, which needs a q.
      expect(calls[0]).not.toContain('_search')
      expect(calls[0]).toContain('limit=10')
    })

    it('lists what came back', async () => {
      setup()
      focusInput()

      await waitFor(() => {
        expect(screen.getByText('name-a')).toBeTruthy()
      })
      expect(screen.getByText('name-b')).toBeTruthy()
    })

    it('scopes the request to the given tenant, package and entity', async () => {
      const { calls } = setup()
      focusInput()

      await waitFor(() => expect(calls.length).toBeGreaterThan(0))
      expect(calls[0]).toContain('/system/core/Workflow')
    })
  })

  describe('searching', () => {
    it('uses the search endpoint once a query is typed', async () => {
      const { calls } = setup()
      const input = focusInput()

      fireEvent.change(input, { target: { value: 'deploy' } })

      await waitFor(() => {
        expect(calls.some(c => c.includes('_search'))).toBe(true)
      })
      expect(calls.find(c => c.includes('_search'))).toContain('q=deploy')
    })
  })
})
