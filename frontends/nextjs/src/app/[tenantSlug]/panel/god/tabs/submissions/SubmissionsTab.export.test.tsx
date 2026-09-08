import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

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
import { message, state } from './submissions-tab-test-state'

beforeEach(() => {
  vi.clearAllMocks()
  hook.useSubmissions.mockReturnValue(state())
})

describe('SubmissionsTab exporting and marking', () => {
  it('exports what is on screen, named for the community', () => {
    render(<SubmissionsTab />)
    fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }))

    expect(download.csvFilename).toHaveBeenCalledWith('acme')
    const [, csv] = download.downloadText.mock.calls[0] as [string, string]
    expect(csv).toContain('Do you build wheels?')
  })

  it('cannot export an empty list', () => {
    hook.useSubmissions.mockReturnValue(state({ visible: [] }))
    render(<SubmissionsTab />)
    expect(
      screen.getByRole('button', { name: 'Export CSV' })
    ).toHaveProperty('disabled', true)
  })

  it('marks a message handled', () => {
    const marked = state()
    hook.useSubmissions.mockReturnValue(marked)
    render(<SubmissionsTab />)

    fireEvent.click(screen.getByRole('button', { name: 'Mark handled' }))

    expect(marked.mark).toHaveBeenCalledWith(message, true)
  })
})
