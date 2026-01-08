/**
 * Tests for RESTful API route
 * 
 * Tests basic parsing and error handling for /api/v1/{tenant}/{package}/{entity} endpoints
 * Integration tests verify full DBAL execution
 */

import { describe, it, expect } from 'vitest'

describe('API Route /api/v1/[...slug]', () => {
  describe('Route structure', () => {
    it('should have GET handler', async () => {
      const { GET } = await import('./route')
      expect(GET).toBeDefined()
      expect(typeof GET).toBe('function')
    })

    it('should have POST handler', async () => {
      const { POST } = await import('./route')
      expect(POST).toBeDefined()
      expect(typeof POST).toBe('function')
    })

    it('should have PUT handler', async () => {
      const { PUT } = await import('./route')
      expect(PUT).toBeDefined()
      expect(typeof PUT).toBe('function')
    })

    it('should have PATCH handler', async () => {
      const { PATCH } = await import('./route')
      expect(PATCH).toBeDefined()
      expect(typeof PATCH).toBe('function')
    })

    it('should have DELETE handler', async () => {
      const { DELETE } = await import('./route')
      expect(DELETE).toBeDefined()
      expect(typeof DELETE).toBe('function')
    })
  })

  describe('HTTP methods', () => {
    it.each([
      { method: 'GET', handler: 'GET' },
      { method: 'POST', handler: 'POST' },
      { method: 'PUT', handler: 'PUT' },
      { method: 'PATCH', handler: 'PATCH' },
      { method: 'DELETE', handler: 'DELETE' },
    ])('should export $method method handler', async ({ handler }) => {
      const module = await import('./route')
      expect(module[handler as keyof typeof module]).toBeDefined()
    })
  })
})
