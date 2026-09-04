import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

const bqlTab = vi.hoisted(() => ({ useBqlTab: vi.fn() }))
vi.mock('./use-bql-tab', () => bqlTab)

import { BqlTab } from './BqlTab'

const node = { id: 'root', type: 'container', props: {}, children: [] }
const stub = (overrides: Record<string, unknown> = {}) => {
  bqlTab.useBqlTab.mockReturnValue({
    script: '',
    setScript: vi.fn(),
    running: false,
    result: null,
    run: vi.fn(async () => {}),
    ...overrides,
  })
}
const runButton = () =>
  screen.getByText('▶ Run').closest('button') as HTMLButtonElement

beforeEach(() => {
  vi.clearAllMocks()
})

describe('BqlTab', () => {
  it('disables Run with an empty script', () => {
    stub({ script: '' })
    render(<BqlTab />)
    expect(runButton().disabled).toBe(true)
  })

  it('enables Run once a script is entered', () => {
    stub({ script: 'add a Heading 1 that says "Hi"' })
    render(<BqlTab />)
    expect(runButton().disabled).toBe(false)
  })

  it('calls run when Run is clicked', () => {
    const run = vi.fn(async () => {})
    stub({ script: 'add a Heading 1 that says "Hi"', run })
    render(<BqlTab />)
    fireEvent.click(screen.getByText('▶ Run'))
    expect(run).toHaveBeenCalled()
  })

  it('shows a running label while applying', () => {
    stub({ script: 'add a Heading 1', running: true })
    render(<BqlTab />)
    expect(screen.getByText('Running…')).toBeTruthy()
  })

  it('shows returned errors', () => {
    stub({
      result: {
        tree: node,
        classes: [],
        errors: [{ line: 2, message: 'No block called "Frobnicator"' }],
        warnings: [],
      },
    })
    render(<BqlTab />)
    expect(screen.getByText('Line 2')).toBeTruthy()
    expect(screen.getByText(/No block called/)).toBeTruthy()
  })

  it('shows success once applied with no errors', () => {
    stub({ result: { tree: node, classes: [], errors: [], warnings: [] } })
    render(<BqlTab />)
    expect(screen.getByText(/Applied to the current page/)).toBeTruthy()
  })

  it('renders on-site docs with the real sentence forms', () => {
    stub()
    render(<BqlTab />)
    expect(screen.getByText('Add a block')).toBeTruthy()
    expect(screen.getByText('Define a reusable style')).toBeTruthy()
  })
})
