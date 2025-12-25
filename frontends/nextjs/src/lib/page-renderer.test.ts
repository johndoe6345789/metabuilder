/**
 * Tests for page-renderer.ts - Page rendering and permission checking
 * Following parameterized test pattern per project conventions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { PageDefinition } from './page-renderer'
import type { User } from './level-types'

// Mock Database
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

vi.mock('./database', () => ({ Database }))
vi.mock('./lua-engine', () => ({ LuaEngine: MockLuaEngine }))

import { PageRenderer, getPageRenderer } from './page-renderer'

// Helper to create mock page definitions
function createMockPage(
  id: string,
  options: Partial<PageDefinition> = {}
): PageDefinition {
  return {
    id,
    level: options.level ?? 1,
    title: options.title ?? `Page ${id}`,
    layout: options.layout ?? 'default',
    components: options.components ?? [],
    permissions: options.permissions,
    luaScripts: options.luaScripts,
    metadata: options.metadata,
  }
}

// Helper to create mock users
function createMockUser(role: string, id = 'user1'): User {
  return {
    id,
    name: `User ${id}`,
    role: role as any,
    level: role === 'public' ? 1 : role === 'user' ? 2 : role === 'admin' ? 3 : role === 'god' ? 4 : 5,
    email: `${id}@test.com`,
  }
}

describe('page-renderer', () => {
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

  describe('checkPermissions', () => {
    it.each([
      {
        name: 'allows when no permissions defined',
        page: createMockPage('open'),
        user: null,
        expectedAllowed: true,
      },
      {
        name: 'blocks unauthenticated user when auth required',
        page: createMockPage('auth', {
          permissions: { requiresAuth: true },
        }),
        user: null,
        expectedAllowed: false,
        expectedReason: 'Authentication required',
      },
      {
        name: 'allows authenticated user when auth required',
        page: createMockPage('auth', {
          permissions: { requiresAuth: true },
        }),
        user: createMockUser('user'),
        expectedAllowed: true,
      },
      {
        name: 'blocks user with insufficient role',
        page: createMockPage('admin', {
          permissions: { requiresAuth: true, requiredRole: 'admin' },
        }),
        user: createMockUser('user'),
        expectedAllowed: false,
        expectedReason: 'Insufficient permissions',
      },
      {
        name: 'allows user with sufficient role',
        page: createMockPage('admin', {
          permissions: { requiresAuth: true, requiredRole: 'admin' },
        }),
        user: createMockUser('admin'),
        expectedAllowed: true,
      },
      {
        name: 'allows god role for admin page',
        page: createMockPage('admin', {
          permissions: { requiresAuth: true, requiredRole: 'admin' },
        }),
        user: createMockUser('god'),
        expectedAllowed: true,
      },
      {
        name: 'allows supergod role for god page',
        page: createMockPage('god', {
          permissions: { requiresAuth: true, requiredRole: 'god' },
        }),
        user: createMockUser('supergod'),
        expectedAllowed: true,
      },
    ])('should handle $name', async ({ page, user, expectedAllowed, expectedReason }) => {
      const result = await renderer.checkPermissions(page, user)

      expect(result.allowed).toBe(expectedAllowed)
      if (expectedReason) {
        expect(result.reason).toBe(expectedReason)
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
