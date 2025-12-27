import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUpdate = vi.fn()
const mockAdapter = { update: mockUpdate }

vi.mock('../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { updatePage } from './update-page'

describe('updatePage', () => {
  beforeEach(() => {
    mockUpdate.mockReset()
  })

  it.each([
    {
      name: 'title only',
      pageId: 'page_1',
      updates: { title: 'New Title' },
    },
    {
      name: 'multiple fields',
      pageId: 'page_2',
      updates: { path: '/new-path', requiresAuth: true, requiredRole: 'admin' },
    },
  ])('should update $name', async ({ pageId, updates }) => {
    mockUpdate.mockResolvedValue(undefined)

    await updatePage(pageId, updates as any)

    expect(mockUpdate).toHaveBeenCalledWith('PageConfig', pageId, expect.any(Object))
  })
})
