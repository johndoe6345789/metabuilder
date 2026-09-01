import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProfileStats } from './ProfileStats'
import type { ProfileSummary } from './profile-summary'

const summary: ProfileSummary = {
  roleLevel: 'Level 3',
  joined: 'Jan 2026',
  role: 'admin',
}

describe('ProfileStats', () => {
  it('renders all three stat values', () => {
    render(<ProfileStats summary={summary} />)
    expect(screen.getByText('Level 3')).toBeTruthy()
    expect(screen.getByText('Jan 2026')).toBeTruthy()
    expect(screen.getByText('admin')).toBeTruthy()
  })

  it('renders all three stat labels', () => {
    render(<ProfileStats summary={summary} />)
    expect(screen.getByText('Access level')).toBeTruthy()
    expect(screen.getByText('Joined')).toBeTruthy()
    expect(screen.getByText('Role')).toBeTruthy()
  })
})
