import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ProfileHero } from './ProfileHero'
import type { ProfileSummary } from './profile-summary'

const summary: ProfileSummary = {
  username: 'alex',
  email: 'alex@example.com',
  role: 'admin',
  roleLevel: 5,
  initial: 'A',
  joined: 'Jan 1, 2026',
}

describe('ProfileHero', () => {
  it('renders the identity details', () => {
    render(
      <ProfileHero
        summary={summary}
        levelColor="#ff0000"
        editing={false}
        onEdit={vi.fn()}
        onCancel={vi.fn()}
        onSave={vi.fn()}
      />
    )
    expect(screen.getByText('alex')).toBeTruthy()
    expect(screen.getByText('Level 5')).toBeTruthy()
    expect(screen.getByText('admin account')).toBeTruthy()
    expect(screen.getByText('alex@example.com')).toBeTruthy()
  })

  it('shows "No email on file" when the email is blank', () => {
    render(
      <ProfileHero
        summary={{ ...summary, email: '' }}
        levelColor="#ff0000"
        editing={false}
        onEdit={vi.fn()}
        onCancel={vi.fn()}
        onSave={vi.fn()}
      />
    )
    expect(screen.getByText('No email on file')).toBeTruthy()
  })

  it('shows only Edit Profile when not editing, and calls onEdit', () => {
    const onEdit = vi.fn()
    render(
      <ProfileHero
        summary={summary}
        levelColor="#ff0000"
        editing={false}
        onEdit={onEdit}
        onCancel={vi.fn()}
        onSave={vi.fn()}
      />
    )
    expect(screen.queryByText('Save changes')).toBeNull()
    fireEvent.click(screen.getByText('Edit Profile'))
    expect(onEdit).toHaveBeenCalledOnce()
  })

  it('shows Cancel and Save changes when editing', () => {
    const onCancel = vi.fn()
    const onSave = vi.fn()
    render(
      <ProfileHero
        summary={summary}
        levelColor="#ff0000"
        editing
        onEdit={vi.fn()}
        onCancel={onCancel}
        onSave={onSave}
      />
    )
    expect(screen.queryByText('Edit Profile')).toBeNull()
    fireEvent.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByText('Save changes'))
    expect(onSave).toHaveBeenCalledOnce()
  })
})
