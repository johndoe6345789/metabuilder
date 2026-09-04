import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import { node, script, stubWith } from './bql-tab-test-harness'

const bqlTab = vi.hoisted(() => ({ useBqlTab: vi.fn() }))
vi.mock('./use-bql-tab', () => bqlTab)

const stub = (over: Record<string, unknown> = {}) =>
  stubWith(bqlTab.useBqlTab, over)

import { BqlTab } from './BqlTab'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('BqlTab', () => {
  it('renders a box per script, each with its own name', () => {
    stub({ scripts: [script('a', 'Page content'), script('b', 'Routes')] })
    render(<BqlTab />)

    const names = screen.getAllByLabelText('Name') as HTMLInputElement[]
    expect(names.map(n => n.value)).toEqual(['Page content', 'Routes'])
    expect(screen.getAllByRole('textbox').length).toBe(4)
  })

  it('shows only the running script as running', () => {
    stub({
      scripts: [script('a', 'Page content'), script('b', 'Routes')],
      runningId: 'b',
    })
    render(<BqlTab />)

    expect(screen.getByText('Running…')).toBeTruthy()
    expect(screen.getAllByText('▶ Run')).toHaveLength(1)
  })

  it('keeps each result with its own script', () => {
    stub({
      scripts: [script('a', 'Page content'), script('b', 'Routes')],
      results: {
        b: {
          tree: node,
          classes: [],
          errors: [{ line: 2, message: 'No block called "Frobnicator"' }],
          warnings: [],
        },
      },
    })
    render(<BqlTab />)

    expect(screen.getByText('Line 2')).toBeTruthy()
    expect(screen.queryAllByText(/Applied to the current page/)).toHaveLength(0)
  })

  it('offers no removal while a single script is left', () => {
    stub()
    render(<BqlTab />)
    expect(screen.queryByLabelText(/^Remove /)).toBeNull()
  })

  it('still renders the on-site docs', () => {
    stub()
    render(<BqlTab />)
    expect(screen.getByText('Add a block')).toBeTruthy()
  })
})

