import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

const auth = vi.hoisted(() => ({ value: null as unknown }))
vi.mock('@/app/_components/auth-provider/auth-provider-component', () => ({
  useAuthContext: () => auth.value,
}))
const transferHook = vi.hoisted(() => ({
  usePowerTransferUsers: vi.fn(() => ({
    allUsers: [],
    selectedUserId: null,
    setSelectedUserId: vi.fn(),
  })),
}))
vi.mock('./use-power-transfer-users', () => transferHook)

import { asUser, authValue } from '@/test/auth-harness'
import { PowerTransferTab } from './PowerTransferTab'

const godUser = {
  id: 'u2',
  username: 'other',
  email: 'other@x',
  role: 'god',
}

beforeEach(() => {
  vi.clearAllMocks()
  auth.value = authValue(asUser())
  transferHook.usePowerTransferUsers.mockReturnValue({
    allUsers: [],
    selectedUserId: null,
    setSelectedUserId: vi.fn(),
  })
})

describe('PowerTransferTab', () => {
  it('shows an empty-state message with no eligible users', () => {
    render(<PowerTransferTab />)
    expect(screen.getByText(/No eligible users/)).toBeTruthy()
  })

  it('lists eligible users', () => {
    transferHook.usePowerTransferUsers.mockReturnValue({
      allUsers: [godUser],
      selectedUserId: null,
      setSelectedUserId: vi.fn(),
    })
    render(<PowerTransferTab />)
    expect(screen.getByText('other')).toBeTruthy()
  })

  it('disables the transfer button with no selection', () => {
    render(<PowerTransferTab />)
    const button = screen.getByText('Initiate Power Transfer').closest(
      'button'
    )
    expect(button?.disabled).toBe(true)
  })

  it('enables the transfer button once a user is selected', () => {
    transferHook.usePowerTransferUsers.mockReturnValue({
      allUsers: [godUser],
      selectedUserId: 'u2',
      setSelectedUserId: vi.fn(),
    })
    render(<PowerTransferTab />)
    const button = screen.getByText('Initiate Power Transfer').closest(
      'button'
    )
    expect(button?.disabled).toBe(false)
  })

  it('selects a user row on click', () => {
    const setSelectedUserId = vi.fn()
    transferHook.usePowerTransferUsers.mockReturnValue({
      allUsers: [godUser],
      selectedUserId: null,
      setSelectedUserId,
    })
    render(<PowerTransferTab />)
    fireEvent.click(screen.getByText('other'))
    expect(setSelectedUserId).toHaveBeenCalledWith('u2')
  })
})
