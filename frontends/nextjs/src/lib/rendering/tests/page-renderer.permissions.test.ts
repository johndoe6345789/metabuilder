import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PageRenderer, type PageDefinition } from '@/lib/rendering/page/page-renderer'
import { createMockPage, createMockUser } from '@/lib/rendering/page/utils'

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

describe('page-renderer permissions', () => {
  let renderer: PageRenderer

  beforeEach(() => {
    vi.clearAllMocks()
    renderer = new PageRenderer()
    Database.getPages.mockResolvedValue([])
    Database.addPage.mockResolvedValue(undefined)
    Database.getLuaScripts.mockResolvedValue([])
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
      const result = await renderer.checkPermissions(page as PageDefinition, user)

      expect(result.allowed).toBe(expectedAllowed)
      if (expectedReason) {
        expect(result.reason).toBe(expectedReason)
      }
    })
  })
})
