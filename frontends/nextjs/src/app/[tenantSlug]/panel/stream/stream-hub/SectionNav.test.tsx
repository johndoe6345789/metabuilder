import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { SectionNav } from './SectionNav'

describe('SectionNav', () => {
  it('marks the active tab selected', () => {
    render(<SectionNav active="radio" onSelect={vi.fn()} />)
    expect(
      screen.getByRole('tab', { name: /Radio/ }).getAttribute('aria-selected')
    ).toBe('true')
  })

  it('calls onSelect with the clicked section', () => {
    const onSelect = vi.fn()
    render(<SectionNav active="tv" onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('tab', { name: /Retro Games/ }))
    expect(onSelect).toHaveBeenCalledWith('retro')
  })
})
