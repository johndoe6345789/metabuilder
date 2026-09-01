import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProfileCard } from './ProfileCard'

describe('ProfileCard', () => {
  it('renders the username, email, role, and level label', () => {
    render(
      <ProfileCard
        username="alice"
        email="alice@example.com"
        role="admin"
        bio={null}
        userLevel={3}
      />
    )
    expect(screen.getByText('alice')).toBeTruthy()
    expect(screen.getByText('alice@example.com')).toBeTruthy()
    expect(screen.getByText('admin')).toBeTruthy()
    expect(screen.getByText('Level 3 — Admin')).toBeTruthy()
  })

  it('shows the uppercased first letter of the username as the avatar', () => {
    render(
      <ProfileCard
        username="bob"
        email="bob@example.com"
        role="user"
        bio={null}
        userLevel={1}
      />
    )
    expect(screen.getByText('B')).toBeTruthy()
  })

  it('renders the bio paragraph when bio has content', () => {
    render(
      <ProfileCard
        username="bob"
        email="bob@example.com"
        role="user"
        bio="Loves testing"
        userLevel={1}
      />
    )
    expect(screen.getByText('Loves testing')).toBeTruthy()
  })

  it('omits the bio paragraph when bio is null or empty', () => {
    const { rerender, container } = render(
      <ProfileCard
        username="bob"
        email="bob@example.com"
        role="user"
        bio={null}
        userLevel={1}
      />
    )
    expect(container.querySelectorAll('p').length).toBe(2)

    rerender(
      <ProfileCard
        username="bob"
        email="bob@example.com"
        role="user"
        bio=""
        userLevel={1}
      />
    )
    expect(container.querySelectorAll('p').length).toBe(2)
  })
})
