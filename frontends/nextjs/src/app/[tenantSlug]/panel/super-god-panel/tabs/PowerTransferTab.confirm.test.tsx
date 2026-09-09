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

/**
 * The button under "This action cannot be undone" had no handler: the one
 * thing this critical action did was nothing, which is indistinguishable
 * from having worked. It asks first now, and says what happened.
 */
describe('handing the instance over', () => {
  it('asks before it writes anything', () => {
    transferHook.usePowerTransferUsers.mockReturnValue({
      allUsers: [godUser],
      selectedUserId: 'u2',
      setSelectedUserId: vi.fn(),
    })
    render(<PowerTransferTab />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Initiate Power Transfer' })
    )

    expect(screen.getByText(/Hand the instance to other/)).toBeTruthy()
  })

  it('does nothing at all until somebody is chosen', () => {
    render(<PowerTransferTab />)
    expect(
      screen.getByRole('button', { name: 'Initiate Power Transfer' })
    ).toHaveProperty('disabled', true)
  })
})
