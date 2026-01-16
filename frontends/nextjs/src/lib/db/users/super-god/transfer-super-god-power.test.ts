import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the getDBALClient module
const mockUpdate = vi.fn()
vi.mock('@/dbal', () => ({
  getDBALClient: vi.fn(() => ({
    users: {
      update: mockUpdate,
    },
  })),
}))

import { transferSuperGodPower } from './transfer-super-god-power'

describe('transferSuperGodPower', () => {
  beforeEach(() => {
    mockUpdate.mockReset()
  })

  it.each([
    { fromUserId: 'user_sg', toUserId: 'user_god' },
    { fromUserId: 'owner_1', toUserId: 'admin_2' },
  ])('updates both users when transferring power', async ({ fromUserId, toUserId }) => {
    mockUpdate.mockResolvedValue({ id: fromUserId })

    await transferSuperGodPower(fromUserId, toUserId)

    expect(mockUpdate).toHaveBeenCalledTimes(2)
    expect(mockUpdate).toHaveBeenNthCalledWith(1, fromUserId, {
      isInstanceOwner: false,
      role: 'god',
    })
    expect(mockUpdate).toHaveBeenNthCalledWith(2, toUserId, {
      isInstanceOwner: true,
      role: 'supergod',
    })
  })

  it('propagates errors from the DBAL client', async () => {
    mockUpdate.mockRejectedValue(new Error('Transfer failed'))

    await expect(transferSuperGodPower('u1', 'u2')).rejects.toThrow('Transfer failed')
  })
})
