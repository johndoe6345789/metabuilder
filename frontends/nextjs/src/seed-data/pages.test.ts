import { describe, it, expect, beforeEach, vi } from 'vitest'

const { getPages } = vi.hoisted(() => ({
  getPages: vi.fn(),
}))

const { initializeDefaultPages } = vi.hoisted(() => ({
  initializeDefaultPages: vi.fn(),
}))

const { getPageDefinitionBuilder } = vi.hoisted(() => ({
  getPageDefinitionBuilder: vi.fn(),
}))

vi.mock('@/lib/database', () => ({
  Database: {
    getPages,
  },
}))

vi.mock('@/lib/rendering/page-definition-builder', () => ({
  getPageDefinitionBuilder,
}))

import { initializePages } from '@/seed-data/pages'

describe('initializePages', () => {
  beforeEach(() => {
    getPages.mockReset()
    getPageDefinitionBuilder.mockReset()
    initializeDefaultPages.mockReset()
  })

  it.each([
    {
      name: 'skip initialization when pages exist',
      existingPages: [{ id: 'page1' }],
      shouldInitialize: false,
    },
    {
      name: 'initialize defaults when no pages exist',
      existingPages: [],
      shouldInitialize: true,
    },
  ])('should $name', async ({ existingPages, shouldInitialize }) => {
    getPages.mockResolvedValue(existingPages)
    getPageDefinitionBuilder.mockReturnValue({ initializeDefaultPages })

    await initializePages()

    expect(getPages).toHaveBeenCalledTimes(1)
    if (shouldInitialize) {
      expect(getPageDefinitionBuilder).toHaveBeenCalledTimes(1)
      expect(initializeDefaultPages).toHaveBeenCalledTimes(1)
    } else {
      expect(getPageDefinitionBuilder).not.toHaveBeenCalled()
      expect(initializeDefaultPages).not.toHaveBeenCalled()
    }
  })
})
