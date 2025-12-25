import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockList = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockAdapter = { list: mockList, create: mockCreate, update: mockUpdate }

vi.mock('../dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { setCredential } from './set-credential'

describe('setCredential', () => {
  beforeEach(() => {
    mockList.mockReset()
    mockCreate.mockReset()
    mockUpdate.mockReset()
  })

  it.each([
    {
      name: 'create new credential when none exists',
      username: 'newuser',
      passwordHash: 'newhash',
      existingCred: [],
      existingUser: [{ id: 'user_1', username: 'newuser' }],
      expectCreate: true,
      expectUpdate: false,
    },
    {
      name: 'update existing credential',
      username: 'existinguser',
      passwordHash: 'updatedhash',
      existingCred: [{ id: 'cred_1', username: 'existinguser', passwordHash: 'oldhash' }],
      existingUser: [{ id: 'user_2', username: 'existinguser' }],
      expectCreate: false,
      expectUpdate: true,
    },
  ])('should $name', async ({ username, passwordHash, existingCred, existingUser, expectCreate, expectUpdate }) => {
    mockList
      .mockResolvedValueOnce({ data: existingCred }) // Credential lookup
      .mockResolvedValueOnce({ data: existingUser }) // User lookup
    mockCreate.mockResolvedValue(undefined)
    mockUpdate.mockResolvedValue(undefined)

    await setCredential(username, passwordHash)

    if (expectCreate) {
      expect(mockCreate).toHaveBeenCalledWith('Credential', { username, passwordHash })
    }
    if (expectUpdate) {
      expect(mockUpdate).toHaveBeenCalledWith('Credential', existingCred[0].id, { passwordHash })
    }
    // Should always update user's password change timestamp
    expect(mockUpdate).toHaveBeenCalledWith('User', existingUser[0].id, expect.objectContaining({
      passwordChangeTimestamp: expect.any(BigInt),
    }))
  })
})
