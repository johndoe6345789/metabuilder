import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the get-dbal module to prevent server-only imports
vi.mock('@/lib/database-dbal/core/get-dbal.server', () => ({
  getDBAL: vi.fn(),
}))

const mockDbalUpdate = vi.fn()

vi.mock('@/lib/database-dbal/users/dbal-update-user.server', () => ({
  dbalUpdateUser: (id: string, payload: Record<string, unknown>) => mockDbalUpdate(id, payload),
}))


import { transferSuperGodPower } from './transfer-super-god-power'

describe('transferSuperGodPower', () => {
  beforeEach(() => {
    mockDbalUpdate.mockReset()
  })

  it.each([
    { fromUserId: 'user_sg', toUserId: 'user_god' },
    { fromUserId: 'owner_1', toUserId: 'admin_2' },
  ])('updates both users when transferring power', async ({ fromUserId, toUserId }) => {
    mockDbalUpdate.mockResolvedValue({ id: fromUserId })

    await transferSuperGodPower(fromUserId, toUserId)

    expect(mockDbalUpdate).toHaveBeenCalledTimes(2)
    expect(mockDbalUpdate).toHaveBeenNthCalledWith(1, fromUserId, {
      isInstanceOwner: false,
      role: 'god',
    })
    expect(mockDbalUpdate).toHaveBeenNthCalledWith(2, toUserId, {
      isInstanceOwner: true,
      role: 'supergod',
    })
  })

  it('propagates errors from the DBAL client', async () => {
    mockDbalUpdate.mockRejectedValue(new Error('Transfer failed'))

    await expect(transferSuperGodPower('u1', 'u2')).rejects.toThrow('Transfer failed')
  })
})
