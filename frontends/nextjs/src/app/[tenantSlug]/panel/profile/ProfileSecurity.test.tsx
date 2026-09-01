import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProfileSecurity } from './ProfileSecurity'

describe('ProfileSecurity', () => {
  it('renders the Security heading', () => {
    render(<ProfileSecurity />)
    expect(screen.getByText('Security')).toBeTruthy()
  })

  it('explains that password changes are not self-service', () => {
    render(<ProfileSecurity />)
    expect(screen.getByText('Password changes')).toBeTruthy()
    expect(
      screen.getByText(/Self-service reset is not available yet/)
    ).toBeTruthy()
  })

  it('does not offer a "Request new password" control', () => {
    render(<ProfileSecurity />)
    expect(screen.queryByText(/Request new password/)).toBeNull()
  })
})
