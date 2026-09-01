import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ConfirmDeleteUser } from './ConfirmDeleteUser'
import type { UserRecord } from './admin-types'

const user: UserRecord = {
  id: 'u1',
  username: 'alice',
  email: 'alice@example.com',
  role: 'user',
  createdAt: '2024-01-01T00:00:00.000Z',
}

describe('ConfirmDeleteUser', () => {
  it('renders nothing when user is null', () => {
    render(
      <ConfirmDeleteUser user={null} onCancel={vi.fn()} onConfirm={vi.fn()} />
    )
    expect(screen.queryByText('Delete this account?')).toBeNull()
  })

  it('shows the username and email when a user is given', () => {
    render(
      <ConfirmDeleteUser user={user} onCancel={vi.fn()} onConfirm={vi.fn()} />
    )
    expect(screen.getByText('Delete this account?')).toBeTruthy()
    expect(screen.getByText(/alice/)).toBeTruthy()
    expect(screen.getByText(/alice@example\.com/)).toBeTruthy()
  })

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = vi.fn()
    render(
      <ConfirmDeleteUser user={user} onCancel={onCancel} onConfirm={vi.fn()} />
    )
    fireEvent.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('calls onConfirm when Delete account is clicked', () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmDeleteUser user={user} onCancel={vi.fn()} onConfirm={onConfirm} />
    )
    fireEvent.click(screen.getByText('Delete account'))
    expect(onConfirm).toHaveBeenCalledOnce()
  })
})
