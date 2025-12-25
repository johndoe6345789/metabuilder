import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockDelete = vi.fn()
const mockAdapter = { delete: mockDelete }

vi.mock('../dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { deletePage } from './delete-page'

describe('deletePage', () => {
  beforeEach(() => {
    mockDelete.mockReset()
  })

  it.each([
    { pageId: 'page_1' },
    { pageId: 'page_home' },
  ])('should delete page $pageId', async ({ pageId }) => {
    mockDelete.mockResolvedValue(undefined)

    await deletePage(pageId)

    expect(mockDelete).toHaveBeenCalledWith('PageConfig', pageId)
  })
})
