import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { ClassPreviewPanel } from './ClassPreviewPanel'

describe('ClassPreviewPanel', () => {
  it('shows an empty preview slot when nothing is selected', () => {
    const { container } = render(<ClassPreviewPanel selected={undefined} />)
    expect(container.querySelector('style')).toBeNull()
  })

  it('shows empty CSS in the code panel when nothing is selected', () => {
    render(<ClassPreviewPanel selected={undefined} />)
    expect(screen.getByText('Show the CSS')).toBeTruthy()
  })

  it('renders the selected style as a stylesheet rule', () => {
    const selected = { id: 'c1', name: 'card', props: { color: 'red' } }
    const { container } = render(<ClassPreviewPanel selected={selected} />)
    expect(container.querySelector('style')?.textContent).toContain(
      'color: red'
    )
  })

  it('shows the selected style as CSS text', () => {
    const selected = { id: 'c1', name: 'card', props: { color: 'red' } }
    render(<ClassPreviewPanel selected={selected} />)
    expect(screen.getByText(/\.card \{/)).toBeTruthy()
  })
})
