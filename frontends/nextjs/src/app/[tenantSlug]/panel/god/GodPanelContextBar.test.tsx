import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GodPanelContextBar } from './GodPanelContextBar'
import type { GodPanelTab } from '@/lib/packages/navigation'

const tab: GodPanelTab = {
  id: 'overview',
  label: 'Overview',
  description: 'The current state of the platform.',
  icon: 'dashboard',
}

describe('GodPanelContextBar', () => {
  it('renders the tab icon, label and description', () => {
    render(<GodPanelContextBar tab={tab} onShowGuide={vi.fn()} />)
    expect(screen.getByText('dashboard')).toBeTruthy()
    expect(screen.getByText('Overview')).toBeTruthy()
    expect(
      screen.getByText('The current state of the platform.')
    ).toBeTruthy()
  })

  it('calls onShowGuide when the guided-path button is clicked', () => {
    const onShowGuide = vi.fn()
    render(<GodPanelContextBar tab={tab} onShowGuide={onShowGuide} />)
    fireEvent.click(screen.getByText('Show guided path'))
    expect(onShowGuide).toHaveBeenCalledOnce()
  })

  it('has an accessible label on the section', () => {
    render(<GodPanelContextBar tab={tab} onShowGuide={vi.fn()} />)
    expect(
      screen.getByLabelText('Current god panel section')
    ).toBeTruthy()
  })
})
