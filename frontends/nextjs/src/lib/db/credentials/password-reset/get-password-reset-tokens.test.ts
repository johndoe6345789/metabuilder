import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockList = vi.fn()
const mockAdapter = { list: mockList }

vi.mock('../dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { getPasswordResetTokens } from './get-password-reset-tokens'

describe('getPasswordResetTokens', () => {
  beforeEach(() => {
    mockList.mockReset()
  })

  it.each([
    {
      name: 'empty object when no tokens stored',
      dbData: [],
      expected: {},
    },
    {
      name: 'parsed tokens from storage',
      dbData: [{ key: 'db_password_reset_tokens', value: '{"admin":"token1","user":"token2"}' }],
      expected: { admin: 'token1', user: 'token2' },
    },
  ])('should return $name', async ({ dbData, expected }) => {
    mockList.mockResolvedValue({ data: dbData })

    const result = await getPasswordResetTokens()

    expect(mockList).toHaveBeenCalledWith('KeyValue', { filter: { key: 'db_password_reset_tokens' } })
    expect(result).toEqual(expected)
  })
})
