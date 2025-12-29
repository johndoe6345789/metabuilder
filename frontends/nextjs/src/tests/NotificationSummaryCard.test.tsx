import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { NotificationSummaryCard } from '@/components/misc/data/NotificationSummaryCard'

describe('NotificationSummaryCard', () => {
  it('renders fallback data when no items are provided', () => {
    render(<NotificationSummaryCard />)

    expect(screen.getByText(/Notification Summary/i)).toBeTruthy()
    expect(screen.getByText(/Pending Reviews/i)).toBeTruthy()
    expect(screen.getByText(/Messages/i)).toBeTruthy()
    expect(screen.getByText(/Total/i)).toBeTruthy()
  })

  it('renders provided items and uses custom labels', () => {
    const props = {
      title: 'Alerts',
      subtitle: 'Tenant-wide events',
      totalLabel: 'Alerts Total',
      items: [
        { label: 'Warnings', count: 4, severity: 'warning' as const, hint: 'Watch closely' },
        { label: 'Messages', count: 8, severity: 'info' as const },
      ],
    }

    render(<NotificationSummaryCard {...props} />)

    expect(screen.getByText('Alerts')).toBeTruthy()
    expect(screen.getByText('Tenant-wide events')).toBeTruthy()
    expect(screen.getByText('Warnings')).toBeTruthy()
    expect(screen.getByText('Messages')).toBeTruthy()
    expect(screen.getByText('Alerts Total')).toBeTruthy()
    expect(screen.getByText('4')).toBeTruthy()
    expect(screen.getByText('8')).toBeTruthy()
  })
})
