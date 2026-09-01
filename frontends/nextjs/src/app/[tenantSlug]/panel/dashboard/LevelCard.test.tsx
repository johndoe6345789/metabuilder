import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LevelCard } from './LevelCard'

describe('LevelCard', () => {
  it('renders the level, name and description', () => {
    render(
      <LevelCard level={2} name="User Area" desc="Profiles" unlocked />
    )
    expect(screen.getByText('2')).toBeTruthy()
    expect(screen.getByText('User Area')).toBeTruthy()
    expect(screen.getByText('Profiles')).toBeTruthy()
  })

  it('shows Unlocked and the unlocked class when unlocked is true', () => {
    render(
      <LevelCard level={2} name="User Area" desc="Profiles" unlocked />
    )
    expect(screen.getByText('Unlocked')).toBeTruthy()
    expect(screen.getByText('User Area').parentElement?.className).toContain(
      'levelCardUnlocked'
    )
  })

  it('shows Locked and the locked badge class when unlocked is false', () => {
    render(
      <LevelCard level={2} name="User Area" desc="Profiles" unlocked={false} />
    )
    expect(screen.getByText('Locked')).toBeTruthy()
    expect(screen.getByText('User Area').parentElement?.className).not
      .toContain('levelCardUnlocked')
    expect(screen.getByText('Locked').className).toContain(
      'levelBadgeLocked'
    )
  })

  it('adds the amber class only for level 5', () => {
    const { rerender } = render(
      <LevelCard level={4} name="God Builder" desc="Schemas" unlocked />
    )
    expect(screen.getByText('God Builder').parentElement?.className).not
      .toContain('levelCardAmber')

    rerender(
      <LevelCard level={5} name="Super God" desc="Control" unlocked />
    )
    expect(screen.getByText('Super God').parentElement?.className).toContain(
      'levelCardAmber'
    )
  })
})
