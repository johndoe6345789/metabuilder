import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatsGrid } from './StatsGrid'
import type { EntityStat } from './admin-types'

const stats: EntityStat[] = [
  { label: 'Total Users', count: 5, icon: 'U' },
  { label: 'Total Comments', count: 12, icon: 'C' },
  { label: 'Admin Users', count: 2, icon: 'A' },
]

describe('StatsGrid', () => {
  it('renders a card per stat with its label and count', () => {
    render(<StatsGrid stats={stats} />)
    expect(screen.getByText('Total Users')).toBeTruthy()
    expect(screen.getByText('5')).toBeTruthy()
    expect(screen.getByText('Total Comments')).toBeTruthy()
    expect(screen.getByText('12')).toBeTruthy()
    expect(screen.getByText('Admin Users')).toBeTruthy()
    expect(screen.getByText('2')).toBeTruthy()
  })

  it('renders the icon for each stat', () => {
    render(<StatsGrid stats={stats} />)
    expect(screen.getByText('U')).toBeTruthy()
    expect(screen.getByText('C')).toBeTruthy()
    expect(screen.getByText('A')).toBeTruthy()
  })

  it('renders nothing when there are no stats', () => {
    const { container } = render(<StatsGrid stats={[]} />)
    expect(container.querySelector('div')?.children.length).toBe(0)
  })
})
