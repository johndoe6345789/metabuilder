import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockList = vi.fn()
const mockAdapter = { list: mockList }

vi.mock('../../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { getCredentials } from './get-credentials'

describe('getCredentials', () => {
  beforeEach(() => {
    mockList.mockReset()
  })

  it.each([
    {
      name: 'empty object when no credentials',
      dbData: [],
      expected: {},
    },
    {
      name: 'single credential',
      dbData: [{ username: 'admin', passwordHash: 'hash123' }],
      expected: { admin: 'hash123' },
    },
    {
      name: 'multiple credentials',
      dbData: [
        { username: 'admin', passwordHash: 'hash1' },
        { username: 'user', passwordHash: 'hash2' },
        { username: 'supergod', passwordHash: 'hash3' },
      ],
      expected: { admin: 'hash1', user: 'hash2', supergod: 'hash3' },
    },
  ])('should return $name', async ({ dbData, expected }) => {
    mockList.mockResolvedValue({ data: dbData })

    const result = await getCredentials()

    expect(mockList).toHaveBeenCalledWith('Credential')
    expect(result).toEqual(expected)
  })
})
