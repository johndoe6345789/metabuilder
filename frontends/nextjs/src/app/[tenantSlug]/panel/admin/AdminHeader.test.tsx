import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { AdminHeader } from './AdminHeader'

describe('AdminHeader', () => {
  it('renders the title and description', () => {
    render(<AdminHeader search="" onSearchChange={vi.fn()} />)
    expect(screen.getByText('Models')).toBeTruthy()
    expect(screen.getByText('Browse and manage data models')).toBeTruthy()
  })

  it('shows the current search value in the field', () => {
    render(<AdminHeader search="alice" onSearchChange={vi.fn()} />)
    expect(screen.getByPlaceholderText('Search...')).toHaveProperty(
      'value',
      'alice'
    )
  })

  it('calls onSearchChange with the new value when typed into', () => {
    const onSearchChange = vi.fn()
    render(<AdminHeader search="" onSearchChange={onSearchChange} />)
    fireEvent.change(screen.getByPlaceholderText('Search...'), {
      target: { value: 'bob' },
    })
    expect(onSearchChange).toHaveBeenCalledWith('bob')
  })
})
