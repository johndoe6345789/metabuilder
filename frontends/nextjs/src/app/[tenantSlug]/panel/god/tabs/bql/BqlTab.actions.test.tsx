import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { stubWith, twoScripts } from './bql-tab-test-harness'

const bqlTab = vi.hoisted(() => ({ useBqlTab: vi.fn() }))
vi.mock('./use-bql-tab', () => bqlTab)

const stub = (over: Record<string, unknown> = {}) =>
  stubWith(bqlTab.useBqlTab, over)

import { BqlTab } from './BqlTab'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('BqlTab actions', () => {
  it('runs the script whose Run was clicked', () => {
    const t = stub(twoScripts())
    render(<BqlTab />)

    fireEvent.click(screen.getAllByText('▶ Run')[1])
    expect(t.run).toHaveBeenCalledWith('b')
  })

  it('removes the script whose ✕ was clicked', () => {
    const t = stub(twoScripts())
    render(<BqlTab />)

    fireEvent.click(screen.getByLabelText('Remove Routes'))
    expect(t.remove).toHaveBeenCalledWith('b')
  })

  it('adds a script', () => {
    const t = stub()
    render(<BqlTab />)
    fireEvent.click(screen.getByText('+ Add script'))
    expect(t.add).toHaveBeenCalled()
  })

  it('edits the text of the script typed into', () => {
    const t = stub(twoScripts())
    render(<BqlTab />)

    const boxes = screen.getAllByRole('textbox')
    fireEvent.change(boxes[3], { target: { value: 'add a Paragraph' } })
    expect(t.patch).toHaveBeenCalledWith('b', { text: 'add a Paragraph' })
  })

  it('renames the script whose name was typed into', () => {
    const t = stub(twoScripts())
    render(<BqlTab />)

    fireEvent.change(screen.getAllByLabelText('Name')[1], {
      target: { value: 'Page routes' },
    })
    expect(t.patch).toHaveBeenCalledWith('b', { name: 'Page routes' })
  })

  it('shows where a script published, and where it could not', () => {
    stub({
      published: {
        a: [
          { path: '/about', ok: true },
          { path: '/contact', ok: false },
        ],
      },
    })
    render(<BqlTab />)

    expect(screen.getByText('✓ Published at /about')).toBeTruthy()
    expect(screen.getByText('Could not publish at /contact')).toBeTruthy()
  })
})
