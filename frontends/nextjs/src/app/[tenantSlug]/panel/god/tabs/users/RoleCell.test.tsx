import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { RoleCell } from './RoleCell'

const god = { id: 'me', role: 'god' }

describe('RoleCell', () => {
  it('offers a founder the roles below god for a member', () => {
    render(
      <RoleCell
        user={{ id: 'u1', username: 'alice', role: 'user' }}
        caller={god}
        onChange={vi.fn()}
      />
    )
    const picker = screen.getByLabelText<HTMLSelectElement>('Role of alice')
    expect(picker.value).toBe('user')
    const offered = [...picker.querySelectorAll('option')].map(o => o.value)
    expect(offered).toEqual(['user', 'moderator', 'admin'])
  })

  it('reports the chosen role with the account it belongs to', () => {
    const onChange = vi.fn()
    const alice = { id: 'u1', username: 'alice', role: 'user' }
    render(<RoleCell user={alice} caller={god} onChange={onChange} />)

    fireEvent.change(screen.getByLabelText('Role of alice'), {
      target: { value: 'moderator' },
    })

    expect(onChange).toHaveBeenCalledWith(alice, 'moderator')
  })

  it("shows the founder's own account as a plain chip", () => {
    render(
      <RoleCell
        user={{ id: 'me', username: 'rosa', role: 'god' }}
        caller={god}
        onChange={vi.fn()}
      />
    )
    expect(screen.queryByRole('combobox')).toBeNull()
    expect(screen.getByText('god')).not.toBeNull()
  })

  it('shows a plain chip to a viewer who may give no roles', () => {
    render(
      <RoleCell
        user={{ id: 'u1', username: 'alice', role: 'user' }}
        caller={{ id: 'v', role: 'user' }}
        onChange={vi.fn()}
      />
    )
    expect(screen.queryByRole('combobox')).toBeNull()
  })
})
