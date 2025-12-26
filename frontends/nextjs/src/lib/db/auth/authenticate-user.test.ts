import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockList = vi.fn()
const mockFindFirst = vi.fn()
const mockAdapter = { list: mockList, findFirst: mockFindFirst }

const mockVerifyPassword = vi.fn()

vi.mock('../dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

vi.mock('../verify-password', () => ({
  verifyPassword: mockVerifyPassword,
}))

import { authenticateUser } from './authenticate-user'

describe('authenticateUser', () => {
  beforeEach(() => {
    mockList.mockReset()
    mockFindFirst.mockReset()
    mockVerifyPassword.mockReset()
  })

  it('returns invalid credentials when credential is missing', async () => {
    mockList.mockResolvedValue({ data: [] })

    const result = await authenticateUser('alice', 'password')

    expect(mockList).toHaveBeenCalledWith('Credential', { filter: { username: 'alice' } })
    expect(mockVerifyPassword).not.toHaveBeenCalled()
    expect(result).toEqual({ success: false, user: null, error: 'invalid_credentials' })
  })

  it('returns invalid credentials when password is wrong', async () => {
    mockList.mockResolvedValue({ data: [{ username: 'alice', passwordHash: 'hash' }] })
    mockVerifyPassword.mockResolvedValue(false)

    const result = await authenticateUser('alice', 'password')

    expect(mockVerifyPassword).toHaveBeenCalledWith('password', 'hash')
    expect(mockFindFirst).not.toHaveBeenCalled()
    expect(result).toEqual({ success: false, user: null, error: 'invalid_credentials' })
  })

  it('returns user_not_found when credential is valid but user missing', async () => {
    mockList.mockResolvedValue({ data: [{ username: 'alice', passwordHash: 'hash' }] })
    mockVerifyPassword.mockResolvedValue(true)
    mockFindFirst.mockResolvedValue(null)

    const result = await authenticateUser('alice', 'password')

    expect(mockFindFirst).toHaveBeenCalledWith('User', { where: { username: 'alice' } })
    expect(result).toEqual({ success: false, user: null, error: 'user_not_found' })
  })

  it.each([
    { firstLogin: true, expected: true },
    { firstLogin: false, expected: false },
  ])('returns requiresPasswordChange=$expected when firstLogin=$firstLogin', async ({ firstLogin, expected }) => {
    mockList.mockResolvedValue({ data: [{ username: 'alice', passwordHash: 'hash' }] })
    mockVerifyPassword.mockResolvedValue(true)
    mockFindFirst.mockResolvedValue({
      id: 'user_1',
      username: 'alice',
      email: 'alice@example.com',
      role: 'user',
      profilePicture: null,
      bio: null,
      createdAt: BigInt(1000),
      tenantId: null,
      isInstanceOwner: false,
      firstLogin,
    })

    const result = await authenticateUser('alice', 'password')

    expect(result).toEqual({
      success: true,
      user: {
        id: 'user_1',
        username: 'alice',
        email: 'alice@example.com',
        role: 'user',
        profilePicture: undefined,
        bio: undefined,
        createdAt: 1000,
        tenantId: undefined,
        isInstanceOwner: false,
      },
      requiresPasswordChange: expected,
    })
  })
})
