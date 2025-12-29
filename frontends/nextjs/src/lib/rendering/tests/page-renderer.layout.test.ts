import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PageRenderer } from '@/lib/rendering/page/page-renderer'
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

describe('page-renderer layout queries', () => {
  let renderer: PageRenderer

  beforeEach(() => {
    vi.clearAllMocks()
    renderer = new PageRenderer()
    Database.getPages.mockResolvedValue([])
    Database.addPage.mockResolvedValue(undefined)
    Database.getLuaScripts.mockResolvedValue([])
  })

  describe('getPagesByLevel', () => {
    it('should filter pages by level', async () => {
      await renderer.registerPage(createMockPage('p1', { level: 1 }))
      await renderer.registerPage(createMockPage('p2', { level: 2 }))
      await renderer.registerPage(createMockPage('p3', { level: 2 }))
      await renderer.registerPage(createMockPage('p4', { level: 3 }))

      const level2Pages = renderer.getPagesByLevel(2)

      expect(level2Pages).toHaveLength(2)
      expect(level2Pages.map(p => p.id)).toContain('p2')
      expect(level2Pages.map(p => p.id)).toContain('p3')
    })

    it('should return empty array for level with no pages', async () => {
      await renderer.registerPage(createMockPage('p1', { level: 1 }))

      const level5Pages = renderer.getPagesByLevel(5)

      expect(level5Pages).toHaveLength(0)
    })
  })
})
