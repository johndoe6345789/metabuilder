import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const config = vi.hoisted(() => ({
  TAB_COMPONENTS: {
    overview: () => <div>Overview content</div>,
  },
}))
vi.mock('./tabs/god-panel-config', () => config)

import { GodPanelPanels } from './GodPanelPanels'

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'not-registered', label: 'Mystery Tab' },
]

describe('GodPanelPanels', () => {
  it('renders the registered tab component', () => {
    render(<GodPanelPanels tabs={tabs} activeTab={0} />)
    expect(screen.getByText('Overview content')).toBeTruthy()
  })

  it('shows a not-yet-implemented message for an unregistered tab id', () => {
    render(<GodPanelPanels tabs={tabs} activeTab={1} />)
    expect(
      screen.getByText(/Mystery Tab.*is not yet implemented/)
    ).toBeTruthy()
  })
})
