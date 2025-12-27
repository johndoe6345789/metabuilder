import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockList = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockAdapter = { list: mockList, create: mockCreate, update: mockUpdate }

vi.mock('../../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

vi.mock('./get-password-reset-tokens', () => ({
  getPasswordResetTokens: vi.fn(() => Promise.resolve({ userToDelete: 'token', other: 'keep' })),
}))

import { deletePasswordResetToken } from './delete-password-reset-token'

describe('deletePasswordResetToken', () => {
  beforeEach(() => {
    mockList.mockReset()
    mockCreate.mockReset()
    mockUpdate.mockReset()
  })

  it.each([
    {
      name: 'update kv when exists',
      existingKV: [{ id: 'kv_1', key: 'db_password_reset_tokens', value: '{}' }],
      expectUpdate: true,
    },
    {
      name: 'create kv when not exists',
      existingKV: [],
      expectUpdate: false,
    },
  ])('should $name', async ({ existingKV, expectUpdate }) => {
    mockList.mockResolvedValue({ data: existingKV })
    mockCreate.mockResolvedValue(undefined)
    mockUpdate.mockResolvedValue(undefined)

    await deletePasswordResetToken('userToDelete')

    if (expectUpdate) {
      expect(mockUpdate).toHaveBeenCalled()
    } else {
      expect(mockCreate).toHaveBeenCalled()
    }
  })
})
