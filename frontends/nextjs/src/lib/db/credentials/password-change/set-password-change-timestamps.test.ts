import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockList = vi.fn()
const mockUpdate = vi.fn()
const mockAdapter = { list: mockList, update: mockUpdate }

vi.mock('../dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { setPasswordChangeTimestamps } from './set-password-change-timestamps'

describe('setPasswordChangeTimestamps', () => {
  beforeEach(() => {
    mockList.mockReset()
    mockUpdate.mockReset()
  })

  it.each([
    {
      name: 'no-op for empty timestamps',
      timestamps: {},
      userLookups: [],
      expectedUpdates: 0,
    },
    {
      name: 'update single user timestamp',
      timestamps: { admin: 1000 },
      userLookups: [[{ id: 'user_1', username: 'admin' }]],
      expectedUpdates: 1,
    },
    {
      name: 'update multiple user timestamps',
      timestamps: { admin: 1000, user: 2000 },
      userLookups: [
        [{ id: 'user_1', username: 'admin' }],
        [{ id: 'user_2', username: 'user' }],
      ],
      expectedUpdates: 2,
    },
    {
      name: 'skip nonexistent users',
      timestamps: { admin: 1000, nonexistent: 2000 },
      userLookups: [[{ id: 'user_1', username: 'admin' }], []],
      expectedUpdates: 1,
    },
  ])('should handle $name', async ({ timestamps, userLookups, expectedUpdates }) => {
    for (const lookup of userLookups) {
      mockList.mockResolvedValueOnce({ data: lookup })
    }
    mockUpdate.mockResolvedValue(undefined)

    await setPasswordChangeTimestamps(timestamps)

    expect(mockUpdate).toHaveBeenCalledTimes(expectedUpdates)
  })
})
