import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockList = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()

vi.mock('../../core/dbal-client', () => ({
  getAdapter: () => ({
    list: mockList,
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
  }),
}))

import {
  addPowerTransferRequest,
  getPowerTransferRequests,
  updatePowerTransferRequest,
} from './index'

describe('power-transfers db helpers', () => {
  beforeEach(() => {
    mockList.mockReset()
    mockCreate.mockReset()
    mockUpdate.mockReset()
    mockDelete.mockReset()
  })

  it('maps stored requests to plain objects', async () => {
    mockList.mockResolvedValue({
      data: [
        {
          id: 'req#1',
          fromUserId: 'user_supergod',
          toUserId: 'user_target',
          status: 'pending',
          createdAt: BigInt(1_000),
          expiresAt: BigInt(5_000),
        },
      ],
    })

    const result = await getPowerTransferRequests()

    expect(mockList).toHaveBeenCalledWith('PowerTransferRequest')
    expect(result).toEqual([
      {
        id: 'req#1',
        fromUserId: 'user_supergod',
        toUserId: 'user_target',
        status: 'pending',
        createdAt: 1000,
        expiresAt: 5000,
      },
    ])
  })

  it('creates power transfer requests with bigint timestamps', async () => {
    const request = {
      id: 'req#2',
      fromUserId: 'user_supergod',
      toUserId: 'user_target',
      status: 'pending' as const,
      createdAt: 1_000,
      expiresAt: 3_000,
    }

    await addPowerTransferRequest(request)

    expect(mockCreate).toHaveBeenCalledWith('PowerTransferRequest', {
      id: 'req#2',
      fromUserId: 'user_supergod',
      toUserId: 'user_target',
      status: 'pending',
      createdAt: BigInt(1_000),
      expiresAt: BigInt(3_000),
    })
  })

  it('updates power transfer request statuses', async () => {
    await updatePowerTransferRequest('req#3', { status: 'accepted' })

    expect(mockUpdate).toHaveBeenCalledWith('PowerTransferRequest', 'req#3', {
      status: 'accepted',
    })
  })
})
