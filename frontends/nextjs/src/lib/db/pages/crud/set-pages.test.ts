import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PageConfig } from '../../types/level-types'

const mockList = vi.fn()
const mockDelete = vi.fn()
const mockCreate = vi.fn()
const mockAdapter = { list: mockList, delete: mockDelete, create: mockCreate }

vi.mock('../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { setPages } from './set-pages'

describe('setPages', () => {
  beforeEach(() => {
    mockList.mockReset()
    mockDelete.mockReset()
    mockCreate.mockReset()
  })

  const cases: Array<{
    name: string
    existing: Array<{ id: string }>
    newPages: PageConfig[]
    expectedDeletes: number
    expectedCreates: number
  }> = [
    {
      name: 'replace all pages',
      existing: [{ id: 'old1' }],
      newPages: [
        { id: 'new1', path: '/', title: 'Home', level: 1, componentTree: [], requiresAuth: false },
      ],
      expectedDeletes: 1,
      expectedCreates: 1,
    },
  ]

  it.each(cases)('should $name', async ({ existing, newPages, expectedDeletes, expectedCreates }) => {
    mockList.mockResolvedValue({ data: existing })
    mockDelete.mockResolvedValue(undefined)
    mockCreate.mockResolvedValue(undefined)

    await setPages(newPages)

    expect(mockDelete).toHaveBeenCalledTimes(expectedDeletes)
    expect(mockCreate).toHaveBeenCalledTimes(expectedCreates)
  })
})
