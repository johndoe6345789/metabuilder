import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LevelsGrid } from './LevelsGrid'

describe('LevelsGrid', () => {
  it('renders the section title and every level name', () => {
    render(<LevelsGrid userLevel={1} />)
    expect(screen.getByText('Five Levels of Power')).toBeTruthy()
    expect(screen.getByText('Public Website')).toBeTruthy()
    expect(screen.getByText('User Area')).toBeTruthy()
    expect(screen.getByText('Admin Panel')).toBeTruthy()
    expect(screen.getByText('God Builder')).toBeTruthy()
    expect(screen.getByText('Super God')).toBeTruthy()
  })

  it('marks levels at or below userLevel as unlocked', () => {
    render(<LevelsGrid userLevel={3} />)
    expect(screen.getByText('Public Website').parentElement?.className)
      .toContain('levelCardUnlocked')
    expect(screen.getByText('Admin Panel').parentElement?.className)
      .toContain('levelCardUnlocked')
  })

  it('marks levels above userLevel as locked', () => {
    render(<LevelsGrid userLevel={3} />)
    expect(screen.getByText('God Builder').parentElement?.className).not
      .toContain('levelCardUnlocked')
    expect(screen.getByText('Super God').parentElement?.className).not
      .toContain('levelCardUnlocked')
  })
})
