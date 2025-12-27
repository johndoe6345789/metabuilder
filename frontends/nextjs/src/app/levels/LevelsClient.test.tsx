import { fireEvent, render, screen } from '@testing-library/react'
import LevelsClient from './LevelsClient'

describe('LevelsClient', () => {
  it('renders permission levels and promotes to the next tier', () => {
    render(<LevelsClient />)
    expect(screen.getByText(/Level 1 · Public/)).toBeTruthy()

    const promoteButton = screen.getByRole('button', { name: /Promote to/ })
    fireEvent.click(promoteButton)

    expect(screen.getByText(/Upgraded to User/)).toBeTruthy()
  })
})
