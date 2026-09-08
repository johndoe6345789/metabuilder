import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const hook = vi.hoisted(() => ({ useSubmissions: vi.fn() }))
const download = vi.hoisted(() => ({
  downloadText: vi.fn(() => true),
  csvFilename: vi.fn(() => 'acme.csv'),
}))
vi.mock('./use-submissions', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, useSubmissions: hook.useSubmissions }
})
vi.mock('./download-csv', () => download)
vi.mock('next/link', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

import { SubmissionsTab } from './SubmissionsTab'
import { state } from './submissions-tab-test-state'

beforeEach(() => {
  vi.clearAllMocks()
  hook.useSubmissions.mockReturnValue(state())
})

describe('SubmissionsTab', () => {
  it('shows what the visitor actually filled in', () => {
    render(<SubmissionsTab />)
    expect(screen.getByText('Do you build wheels?')).not.toBeNull()
    expect(screen.getByText('name')).not.toBeNull()
  })

  /**
   * An inbox that could not be read used to be indistinguishable from an
   * empty one -- so the failure has to say so, and must not be dressed up
   * as "nothing yet".
   */
  it('reports a failed read rather than an empty inbox', () => {
    hook.useSubmissions.mockReturnValue(
      state({ rows: [], visible: [], error: 'HTTP 404' })
    )
    render(<SubmissionsTab />)

    expect(screen.getByRole('alert').textContent).toBe('HTTP 404')
    expect(screen.queryByText(/Nothing yet/)).toBeNull()
  })

  it('says nothing has arrived when nothing has', () => {
    hook.useSubmissions.mockReturnValue(state({ rows: [], visible: [] }))
    render(<SubmissionsTab />)
    expect(screen.getByText(/Nothing yet/)).not.toBeNull()
  })

  it('tells the founder a filter is hiding the rest', () => {
    hook.useSubmissions.mockReturnValue(state({ visible: [] }))
    render(<SubmissionsTab />)
    expect(screen.getByText(/Nothing matches that filter/)).not.toBeNull()
  })
})
