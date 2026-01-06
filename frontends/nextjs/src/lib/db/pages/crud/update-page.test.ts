import { beforeEach, describe, expect, it, vi } from 'vitest'

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await updatePage(pageId, updates as any)

    expect(mockUpdate).toHaveBeenCalledWith('PageConfig', pageId, expect.any(Object))
  })
})
