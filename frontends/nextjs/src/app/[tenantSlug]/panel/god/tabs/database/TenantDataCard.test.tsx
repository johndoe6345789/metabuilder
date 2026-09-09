import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const hook = vi.hoisted(() => ({ useTenantData: vi.fn() }))
vi.mock('./use-tenant-data', () => hook)

import { TenantDataCard } from './TenantDataCard'

const state = (over: Record<string, unknown> = {}) => ({
  tenant: 'harbour',
  counts: [
    { key: 'users', path: 'core/User', rows: 2, more: false },
    { key: 'formSubmissions', path: 'core/FormSubmission', rows: 7, more: false },
  ],
  loading: false,
  unreadable: false,
  total: 9,
  refresh: vi.fn(),
  ...over,
})

beforeEach(() => {
  vi.clearAllMocks()
  hook.useTenantData.mockReturnValue(state())
})

describe('TenantDataCard', () => {
  it('names the community and totals its rows', () => {
    render(<TenantDataCard />)
    expect(screen.getByText(/What harbour holds/)).toBeTruthy()
    expect(screen.getByText(/9 rows across 2 collections/)).toBeTruthy()
  })

  it('reads each collection out in words', () => {
    render(<TenantDataCard />)
    expect(screen.getByText('Form submissions')).toBeTruthy()
    expect(screen.getByText('7')).toBeTruthy()
  })

  /**
   * A data layer that is down looks exactly like a community with
   * nothing in it, which is the one thing this card must not do.
   */
  it('says nothing answered rather than showing zero', () => {
    hook.useTenantData.mockReturnValue(
      state({ unreadable: true, total: 0, counts: [] })
    )
    render(<TenantDataCard />)
    expect(screen.getByRole('alert').textContent).toContain('did not answer')
    expect(screen.queryByText(/0 rows across/)).toBeNull()
  })

  it('says it is counting while it is', () => {
    hook.useTenantData.mockReturnValue(state({ loading: true }))
    render(<TenantDataCard />)
    expect(screen.getByText('Counting…')).toBeTruthy()
  })
})
