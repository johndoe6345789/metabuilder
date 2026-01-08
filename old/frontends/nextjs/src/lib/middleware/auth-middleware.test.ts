import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { authenticate, requireAuth } from './auth-middleware'
import type { CurrentUser } from '@/lib/auth/get-current-user'

// Mock the getCurrentUser function
vi.mock('@/lib/auth/get-current-user', () => ({
  getCurrentUser: vi.fn(),
}))

// Import mocked function for type safety
import { getCurrentUser } from '@/lib/auth/get-current-user'

describe('auth-middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const createMockUser = (overrides?: Partial<CurrentUser>): CurrentUser => ({
    id: 'user-123',
    email: 'user@example.com',
    username: 'testuser',
    role: 'user',
    level: 1,
    tenantId: 'tenant-1',
    createdAt: Date.now(),
    ...overrides,
  })

  const createMockRequest = (): NextRequest => {
    return new NextRequest('http://localhost:3000/api/test')
  }

  describe('authenticate', () => {
    describe('public access', () => {
      it.each([
        { name: 'allows public access when allowPublic is true', allowPublic: true },
      ])('should allow $name', async ({ allowPublic }) => {
        const request = createMockRequest()
        const result = await authenticate(request, { allowPublic })

        expect(result.success).toBe(true)
        expect(result.user).toBeUndefined()
        expect(result.error).toBeUndefined()
      })
    })

    describe('unauthenticated requests', () => {
      it.each([
        { name: 'no user (null)', mockUser: null, expectedStatus: 401 },
        { name: 'undefined user', mockUser: undefined, expectedStatus: 401 },
      ])('should return 401 for $name', async ({ mockUser, expectedStatus }) => {
        vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any)
        
        const request = createMockRequest()
        const result = await authenticate(request, { minLevel: 0 })

        expect(result.success).toBe(false)
        expect(result.error).toBeDefined()
        
        if (result.error !== null && result.error !== undefined) {
          expect(result.error.status).toBe(expectedStatus)
          const body = await result.error.json()
          expect(body.error).toBe('Unauthorized')
        }
      })
    })

    describe('permission level checks', () => {
      it.each([
        { userLevel: 0, minLevel: 0, shouldPass: true, name: 'public user accessing public endpoint' },
        { userLevel: 1, minLevel: 0, shouldPass: true, name: 'user accessing public endpoint' },
        { userLevel: 1, minLevel: 1, shouldPass: true, name: 'user accessing user endpoint' },
        { userLevel: 2, minLevel: 1, shouldPass: true, name: 'moderator accessing user endpoint' },
        { userLevel: 3, minLevel: 3, shouldPass: true, name: 'admin accessing admin endpoint' },
        { userLevel: 4, minLevel: 3, shouldPass: true, name: 'god accessing admin endpoint' },
        { userLevel: 5, minLevel: 5, shouldPass: true, name: 'supergod accessing supergod endpoint' },
        { userLevel: 0, minLevel: 1, shouldPass: false, name: 'public user accessing user endpoint' },
        { userLevel: 1, minLevel: 2, shouldPass: false, name: 'user accessing moderator endpoint' },
        { userLevel: 2, minLevel: 3, shouldPass: false, name: 'moderator accessing admin endpoint' },
        { userLevel: 3, minLevel: 4, shouldPass: false, name: 'admin accessing god endpoint' },
        { userLevel: 4, minLevel: 5, shouldPass: false, name: 'god accessing supergod endpoint' },
      ])('should handle $name (level $userLevel, required $minLevel)', async ({ userLevel, minLevel, shouldPass }) => {
        const mockUser = createMockUser({ level: userLevel })
        vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
        
        const request = createMockRequest()
        const result = await authenticate(request, { minLevel })

        if (shouldPass) {
          expect(result.success).toBe(true)
          expect(result.user).toEqual(mockUser)
          expect(result.error).toBeUndefined()
        } else {
          expect(result.success).toBe(false)
          expect(result.error).toBeDefined()
          
          if (result.error !== null && result.error !== undefined) {
            expect(result.error.status).toBe(403)
            const body = await result.error.json()
            expect(body.error).toBe('Forbidden')
            expect(body.requiredLevel).toBe(minLevel)
            expect(body.userLevel).toBe(userLevel)
          }
        }
      })
    })

    describe('custom permission checks', () => {
      it('should pass when custom check returns true', async () => {
        const mockUser = createMockUser()
        vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
        
        const customCheck = vi.fn().mockReturnValue(true)
        const request = createMockRequest()
        const result = await authenticate(request, { customCheck })

        expect(result.success).toBe(true)
        expect(customCheck).toHaveBeenCalledWith(mockUser)
      })

      it('should fail when custom check returns false', async () => {
        const mockUser = createMockUser()
        vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
        
        const customCheck = vi.fn().mockReturnValue(false)
        const request = createMockRequest()
        const result = await authenticate(request, { customCheck })

        expect(result.success).toBe(false)
        expect(result.error).toBeDefined()
        
        if (result.error !== null && result.error !== undefined) {
          expect(result.error.status).toBe(403)
          const body = await result.error.json()
          expect(body.error).toBe('Forbidden')
        }
      })
    })

    describe('error handling', () => {
      it('should handle getCurrentUser errors', async () => {
        vi.mocked(getCurrentUser).mockRejectedValue(new Error('Database error'))
        
        const request = createMockRequest()
        const result = await authenticate(request, { minLevel: 1 })

        expect(result.success).toBe(false)
        expect(result.error).toBeDefined()
        
        if (result.error !== null && result.error !== undefined) {
          expect(result.error.status).toBe(500)
          const body = await result.error.json()
          expect(body.error).toBe('Internal Server Error')
        }
      })
    })
  })

  describe('requireAuth', () => {
    it('should return user when authentication succeeds', async () => {
      const mockUser = createMockUser()
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
      
      const request = createMockRequest()
      const user = await requireAuth(request, { minLevel: 1 })

      expect(user).toEqual(mockUser)
    })

    it('should throw error response when authentication fails', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null)
      
      const request = createMockRequest()

      await expect(
        requireAuth(request, { minLevel: 1 })
      ).rejects.toBeDefined()
    })

    it('should throw error response when permission check fails', async () => {
      const mockUser = createMockUser({ level: 1 })
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
      
      const request = createMockRequest()

      await expect(
        requireAuth(request, { minLevel: 3 })
      ).rejects.toBeDefined()
    })
  })
})
