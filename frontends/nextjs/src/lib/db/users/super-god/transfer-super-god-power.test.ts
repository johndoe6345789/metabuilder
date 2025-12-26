import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUpdate = vi.fn()
const mockAdapter = { update: mockUpdate }

vi.mock('../dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { transferSuperGodPower } from './transfer-super-god-power'

describe('transferSuperGodPower', () => {
  beforeEach(() => {
    mockUpdate.mockReset()
  })

  it.each([
    { fromUserId: 'user_sg', toUserId: 'user_god' },
    { fromUserId: 'owner_1', toUserId: 'admin_2' },
  ])('should transfer from $fromUserId to $toUserId', async ({ fromUserId, toUserId }) => {
    mockUpdate.mockResolvedValue(undefined)

    await transferSuperGodPower(fromUserId, toUserId)

    expect(mockUpdate).toHaveBeenCalledTimes(2)
    expect(mockUpdate).toHaveBeenNthCalledWith(1, 'User', fromUserId, {
      isInstanceOwner: false,
      role: 'god',
    })
    expect(mockUpdate).toHaveBeenNthCalledWith(2, 'User', toUserId, {
      isInstanceOwner: true,
      role: 'supergod',
    })
  })

  it('should propagate adapter errors', async () => {
    mockUpdate.mockRejectedValue(new Error('Transfer failed'))

    await expect(transferSuperGodPower('u1', 'u2')).rejects.toThrow('Transfer failed')
  })
})
