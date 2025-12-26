import { describe, it, expect, beforeEach, vi } from 'vitest'

const {
  getUsers,
  setCredential,
  setFirstLoginFlag,
  addUser,
  setGodCredentialsExpiry,
  hashPassword,
} = vi.hoisted(() => ({
  getUsers: vi.fn(),
  setCredential: vi.fn(),
  setFirstLoginFlag: vi.fn(),
  addUser: vi.fn(),
  setGodCredentialsExpiry: vi.fn(),
  hashPassword: vi.fn(),
}))

const { getScrambledPassword } = vi.hoisted(() => ({
  getScrambledPassword: vi.fn(),
}))

vi.mock('@/lib/database', () => ({
  Database: {
    getUsers,
    setCredential,
    setFirstLoginFlag,
    addUser,
    setGodCredentialsExpiry,
  },
  hashPassword,
}))

vi.mock('@/lib/auth', () => ({
  getScrambledPassword,
}))

import { initializeUsers } from '@/seed-data/users'

const expectedUsernames = ['supergod', 'god', 'admin', 'alice', 'bob']

describe('initializeUsers', () => {
  beforeEach(() => {
    getUsers.mockReset()
    setCredential.mockReset()
    setFirstLoginFlag.mockReset()
    addUser.mockReset()
    setGodCredentialsExpiry.mockReset()
    hashPassword.mockReset()
    getScrambledPassword.mockReset()
  })

  it.each([
    {
      name: 'skip seeding when users exist',
      existingUsers: [{ id: 'existing' }],
      expectedAdds: 0,
    },
    {
      name: 'seed users when none exist',
      existingUsers: [],
      expectedAdds: expectedUsernames.length,
    },
  ])('should $name', async ({ existingUsers, expectedAdds }) => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(1000)
    getUsers.mockResolvedValue(existingUsers)
    getScrambledPassword.mockImplementation((username: string) => `scrambled-${username}`)
    hashPassword.mockImplementation(async (value: string) => `hash-${value}`)

    if (expectedAdds === 0) {
      await initializeUsers()
    } else {
      await expect(initializeUsers()).resolves.toBeUndefined()
    }

    expect(getUsers).toHaveBeenCalledTimes(1)
    expect(addUser).toHaveBeenCalledTimes(expectedAdds)
    expect(setCredential).toHaveBeenCalledTimes(expectedAdds)
    expect(setFirstLoginFlag).toHaveBeenCalledTimes(expectedAdds)

    if (expectedAdds === 0) {
      expect(getScrambledPassword).not.toHaveBeenCalled()
      expect(hashPassword).not.toHaveBeenCalled()
      expect(setGodCredentialsExpiry).not.toHaveBeenCalled()
    } else {
      expectedUsernames.forEach(username => {
        expect(getScrambledPassword).toHaveBeenCalledWith(username)
        expect(hashPassword).toHaveBeenCalledWith(`scrambled-${username}`)
        expect(setCredential).toHaveBeenCalledWith(username, `hash-scrambled-${username}`)
        expect(setFirstLoginFlag).toHaveBeenCalledWith(username, true)
        expect(addUser).toHaveBeenCalledWith(expect.objectContaining({ username }))
      })
      expect(setGodCredentialsExpiry).toHaveBeenCalledWith(1000 + 60 * 60 * 1000)
    }

    nowSpy.mockRestore()
  })
})
