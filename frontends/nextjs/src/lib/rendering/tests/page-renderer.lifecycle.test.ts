import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getPageRenderer, PageRenderer } from '@/lib/rendering/page/page-renderer'
import { createMockPage } from '@/lib/rendering/page/utils'

const { Database, MockLuaEngine } = vi.hoisted(() => {
  class MockLuaEngine {
    execute = vi.fn()
  }
  return {
    Database: {
      getPages: vi.fn(),
      addPage: vi.fn(),
      getLuaScripts: vi.fn(),
    },
    MockLuaEngine,
  }
})

vi.mock('@/lib/database', () => ({ Database }))
vi.mock('@/lib/lua-engine', () => ({ LuaEngine: MockLuaEngine }))

describe('page-renderer lifecycle', () => {
  let renderer: PageRenderer

  beforeEach(() => {
    vi.clearAllMocks()
    renderer = new PageRenderer()
    Database.getPages.mockResolvedValue([])
    Database.addPage.mockResolvedValue(undefined)
    Database.getLuaScripts.mockResolvedValue([])
  })

  describe('registerPage', () => {
    it('should register a page and add to database', async () => {
      const page = createMockPage('test-page', { title: 'Test Page' })

      await renderer.registerPage(page)

      expect(Database.addPage).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-page',
          title: 'Test Page',
        })
      )
      expect(renderer.getPage('test-page')).toEqual(page)
    })

    it('should handle pages with permissions', async () => {
      const page = createMockPage('auth-page', {
        permissions: {
          requiresAuth: true,
          requiredRole: 'admin',
        },
      })

      await renderer.registerPage(page)

      expect(Database.addPage).toHaveBeenCalledWith(
        expect.objectContaining({
          requiresAuth: true,
          requiredRole: 'admin',
        })
      )
    })
  })

  describe('loadPages', () => {
    it('should load pages from database', async () => {
      Database.getPages.mockResolvedValue([
        {
          id: 'page1',
          title: 'Page 1',
          level: 2,
          componentTree: [],
          requiresAuth: false,
        },
        {
          id: 'page2',
          title: 'Page 2',
          level: 3,
          componentTree: [{ id: 'c1', type: 'text' }],
          requiresAuth: true,
          requiredRole: 'admin',
        },
      ])

      await renderer.loadPages()

      expect(renderer.getPage('page1')).toBeDefined()
      expect(renderer.getPage('page2')).toBeDefined()
      expect(renderer.getPage('page1')?.title).toBe('Page 1')
      expect(renderer.getPage('page2')?.permissions?.requiresAuth).toBe(true)
    })

    it('should handle empty database', async () => {
      Database.getPages.mockResolvedValue([])

      await renderer.loadPages()

      expect(renderer.getPage('nonexistent')).toBeUndefined()
    })
  })

  describe('getPage', () => {
    it.each([
      {
        name: 'returns page when exists',
        pageId: 'existing',
        expectFound: true,
      },
      {
        name: 'returns undefined when not exists',
        pageId: 'nonexistent',
        expectFound: false,
      },
    ])('should handle $name', async ({ pageId, expectFound }) => {
      await renderer.registerPage(createMockPage('existing'))

      const result = renderer.getPage(pageId)

      if (expectFound) {
        expect(result).toBeDefined()
        expect(result?.id).toBe(pageId)
      } else {
        expect(result).toBeUndefined()
      }
    })
  })

  describe('getPageRenderer singleton', () => {
    it('should return the same instance', () => {
      const instance1 = getPageRenderer()
      const instance2 = getPageRenderer()

      expect(instance1).toBe(instance2)
    })
  })
})
