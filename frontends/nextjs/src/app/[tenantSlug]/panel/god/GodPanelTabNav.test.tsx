import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GodPanelTabNav } from './GodPanelTabNav'
import type { GodPanelTab } from '@/lib/packages/navigation'

const tabs: GodPanelTab[] = [
  { id: 'overview', label: 'Overview', icon: 'home', description: 'd' },
  { id: 'plan', label: 'Plan', icon: 'flag', description: 'd' },
]

describe('GodPanelTabNav', () => {
  it('renders every tab by label', () => {
    render(
      <GodPanelTabNav tabs={tabs} activeTab={0} tabHref={vi.fn(id => `/${id}`)} />
    )
    expect(screen.getByText('Overview')).toBeTruthy()
    expect(screen.getByText('Plan')).toBeTruthy()
  })

  it('marks only the active tab, with aria-current', () => {
    render(<GodPanelTabNav tabs={tabs} activeTab={1} tabHref={id => `/${id}`} />)
    const active = screen.getByText('Plan').closest('a')
    const inactive = screen.getByText('Overview').closest('a')
    expect(active?.className).toContain('pillActive')
    expect(active?.getAttribute('aria-current')).toBe('page')
    expect(inactive?.className).not.toContain('pillActive')
    expect(inactive?.getAttribute('aria-current')).toBeNull()
  })

  it('links each tab through tabHref', () => {
    render(
      <GodPanelTabNav
        tabs={tabs}
        activeTab={0}
        tabHref={id => `/acme/panel/god/${id}`}
      />
    )
    expect(screen.getByText('Plan').closest('a')?.getAttribute('href')).toBe(
      '/acme/panel/god/plan'
    )
  })
})
