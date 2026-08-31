import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { HeroEmpty } from './HeroEmpty'

describe('HeroEmpty', () => {
  it('invites scheduling a program', () => {
    render(<HeroEmpty />)
    expect(screen.getByText(/Schedule a program/)).toBeTruthy()
  })
})
