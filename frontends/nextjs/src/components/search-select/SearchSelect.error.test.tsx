import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { setup, focusInput } from './search-select-test-helpers'

// Failed/malformed responses -- split out of SearchSelect.test.tsx (which
// covers opening/searching) to stay under the 80-line file limit.

describe('SearchSelect when the request fails', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows no results rather than stale ones on a non-ok response', async () => {
    const { calls } = setup({}, 500)
    focusInput()

    await waitFor(() => expect(calls.length).toBeGreaterThan(0))
    expect(screen.queryByText('name-a')).toBeNull()
  })

  it('survives a malformed body', async () => {
    setup({ nonsense: true })
    focusInput()

    await waitFor(() => {
      expect(screen.queryByText('name-a')).toBeNull()
    })
  })
})
