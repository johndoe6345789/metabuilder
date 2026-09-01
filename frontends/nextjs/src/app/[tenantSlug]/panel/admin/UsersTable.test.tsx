import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UsersTable } from './UsersTable'
import type { UserRecord } from './admin-types'

const user: UserRecord = {
  id: 'u1',
  username: 'alex',
  email: 'alex@x.com',
  role: 'user',
  createdAt: '2026-01-01T00:00:00Z',
}

describe('UsersTable', () => {
  it('shows the empty message when there are no users', () => {
    render(
      <UsersTable users={[]} emptyMessage="No users yet" onDelete={vi.fn()} />
    )
    expect(screen.getByText('No users yet')).toBeTruthy()
  })

  it('renders a row per user', () => {
    render(
      <UsersTable users={[user]} emptyMessage="none" onDelete={vi.fn()} />
    )
    expect(screen.getByText('alex')).toBeTruthy()
    expect(screen.getByText('alex@x.com')).toBeTruthy()
  })

  it('renders the column headers', () => {
    render(<UsersTable users={[]} emptyMessage="none" onDelete={vi.fn()} />)
    expect(screen.getByText('Username')).toBeTruthy()
    expect(screen.getByText('Actions')).toBeTruthy()
  })
})
