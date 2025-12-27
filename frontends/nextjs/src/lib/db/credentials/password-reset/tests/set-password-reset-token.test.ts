import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockList = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockAdapter = { list: mockList, create: mockCreate, update: mockUpdate }

vi.mock('../../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

vi.mock('./get-password-reset-tokens', () => ({
  getPasswordResetTokens: vi.fn(() => Promise.resolve({ existing: 'token' })),
}))

import { setPasswordResetToken } from './set-password-reset-token'

describe('setPasswordResetToken', () => {
  beforeEach(() => {
    mockList.mockReset()
    mockCreate.mockReset()
    mockUpdate.mockReset()
  })

  it.each([
    {
      name: 'create new when no existing kv',
      existingKV: [],
      expectCreate: true,
    },
    {
      name: 'update when kv exists',
      existingKV: [{ id: 'kv_1', key: 'db_password_reset_tokens', value: '{}' }],
      expectCreate: false,
    },
  ])('should $name', async ({ existingKV, expectCreate }) => {
    mockList.mockResolvedValue({ data: existingKV })
    mockCreate.mockResolvedValue(undefined)
    mockUpdate.mockResolvedValue(undefined)

    await setPasswordResetToken('newuser', 'newtoken')

    if (expectCreate) {
      expect(mockCreate).toHaveBeenCalledWith('KeyValue', {
        key: 'db_password_reset_tokens',
        value: expect.stringContaining('newuser'),
      })
    } else {
      expect(mockUpdate).toHaveBeenCalled()
    }
  })
})
