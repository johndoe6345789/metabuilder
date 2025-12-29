import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCreate = vi.fn()
const mockAdapter = { create: mockCreate }

vi.mock('../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { addPage } from './add-page'

describe('addPage', () => {
  beforeEach(() => {
    mockCreate.mockReset()
  })

  it.each([
    {
      name: 'basic page',
      page: {
        id: 'page_1',
        path: '/home',
        title: 'Home',
        level: 1,
        componentTree: [{ id: 'comp1', type: 'Container' }],
        requiresAuth: false,
      },
    },
    {
      name: 'authenticated page',
      page: {
        id: 'page_2',
        path: '/dashboard',
        title: 'Dashboard',
        level: 2,
        componentTree: [],
        requiresAuth: true,
        requiredRole: 'user',
      },
    },
  ])('should add $name', async ({ page }) => {
    mockCreate.mockResolvedValue(undefined)

    await addPage(page as any)

    expect(mockCreate).toHaveBeenCalledWith(
      'PageConfig',
      expect.objectContaining({
        id: page.id,
        path: page.path,
        title: page.title,
        level: page.level,
        requiresAuth: page.requiresAuth,
      })
    )
  })
})
