/**
 * Tests for RESTful API route
 * 
 * Comprehensive test coverage for /api/v1/{tenant}/{package}/{entity} endpoints
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST, PUT, DELETE } from './route'

// Mock dependencies
vi.mock('@/lib/routing', () => ({
  errorResponse: vi.fn((message: string, status: number) => ({
    json: async () => ({ error: message }),
    status,
  })),
  executeDbalOperation: vi.fn(),
  executePackageAction: vi.fn(),
  getSessionUser: vi.fn(),
  parseRestfulRequest: vi.fn(),
  STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500,
  },
  successResponse: vi.fn((data: unknown, status: number) => ({
    json: async () => data,
    status,
  })),
  validatePackageRoute: vi.fn(),
  validateTenantAccess: vi.fn(),
}))

vi.mock('@/lib/logging', () => ({
  logger: {
    error: vi.fn(),
  },
  apiError: vi.fn((error: unknown) => String(error)),
}))

describe('API Route /api/v1/[...slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET method', () => {
    it.each([
      {
        slug: ['tenant1', 'package1', 'entity1'],
        expected: { operation: 'list' },
      },
      {
        slug: ['tenant1', 'package1', 'entity1', 'id123'],
        expected: { operation: 'read' },
      },
    ])('should handle GET request for $slug', async ({ slug }) => {
      const { parseRestfulRequest, getSessionUser, validatePackageRoute, validateTenantAccess, executeDbalOperation, successResponse } = await import('@/lib/routing')
      
      vi.mocked(parseRestfulRequest).mockReturnValue({
        route: { tenant: slug[0], package: slug[1], entity: slug[2], id: slug[3] },
        operation: slug.length === 4 ? 'read' : 'list',
        dbalOp: { entity: slug[2], operation: slug.length === 4 ? 'get' : 'list' },
      })
      
      vi.mocked(getSessionUser).mockResolvedValue({
        user: { id: 'user1', role: 'user', tenantId: 'tenant1' },
      })
      
      vi.mocked(validatePackageRoute).mockReturnValue({
        allowed: true,
        package: { minLevel: 1 },
      })
      
      vi.mocked(validateTenantAccess).mockResolvedValue({
        allowed: true,
        tenant: { id: 'tenant1', name: 'Tenant 1' },
      })
      
      vi.mocked(executeDbalOperation).mockResolvedValue({
        success: true,
        data: [{ id: '1', name: 'Test' }],
      })
      
      vi.mocked(successResponse).mockReturnValue({
        json: async () => [{ id: '1', name: 'Test' }],
        status: 200,
      } as any)

      const request = new NextRequest(`http://localhost:3000/api/v1/${slug.join('/')}`)
      const params = { params: Promise.resolve({ slug }) }

      await GET(request, params)

      expect(parseRestfulRequest).toHaveBeenCalled()
      expect(getSessionUser).toHaveBeenCalled()
      expect(validatePackageRoute).toHaveBeenCalled()
      expect(validateTenantAccess).toHaveBeenCalled()
      expect(executeDbalOperation).toHaveBeenCalled()
    })
  })

  describe('POST method', () => {
    it.each([
      {
        slug: ['tenant1', 'package1', 'entity1'],
        body: { name: 'Test Entity' },
        expected: { status: 201 },
      },
    ])('should handle POST request for creating entity', async ({ slug, body }) => {
      const { parseRestfulRequest, getSessionUser, validatePackageRoute, validateTenantAccess, executeDbalOperation, successResponse, STATUS } = await import('@/lib/routing')
      
      vi.mocked(parseRestfulRequest).mockReturnValue({
        route: { tenant: slug[0], package: slug[1], entity: slug[2] },
        operation: 'create',
        dbalOp: { entity: slug[2], operation: 'create' },
      })
      
      vi.mocked(getSessionUser).mockResolvedValue({
        user: { id: 'user1', role: 'user', tenantId: 'tenant1' },
      })
      
      vi.mocked(validatePackageRoute).mockReturnValue({
        allowed: true,
        package: { minLevel: 1 },
      })
      
      vi.mocked(validateTenantAccess).mockResolvedValue({
        allowed: true,
        tenant: { id: 'tenant1', name: 'Tenant 1' },
      })
      
      vi.mocked(executeDbalOperation).mockResolvedValue({
        success: true,
        data: { id: 'new-id', ...body },
      })
      
      vi.mocked(successResponse).mockReturnValue({
        json: async () => ({ id: 'new-id', ...body }),
        status: STATUS.CREATED,
      } as any)

      const request = new NextRequest(`http://localhost:3000/api/v1/${slug.join('/')}`, {
        method: 'POST',
        body: JSON.stringify(body),
      })
      const params = { params: Promise.resolve({ slug }) }

      await POST(request, params)

      expect(executeDbalOperation).toHaveBeenCalled()
      expect(successResponse).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'new-id' }),
        STATUS.CREATED
      )
    })
  })

  describe('PUT method', () => {
    it.each([
      {
        slug: ['tenant1', 'package1', 'entity1', 'id123'],
        body: { name: 'Updated Entity' },
        expected: { status: 200 },
      },
    ])('should handle PUT request for updating entity', async ({ slug, body }) => {
      const { parseRestfulRequest, getSessionUser, validatePackageRoute, validateTenantAccess, executeDbalOperation, successResponse, STATUS } = await import('@/lib/routing')
      
      vi.mocked(parseRestfulRequest).mockReturnValue({
        route: { tenant: slug[0], package: slug[1], entity: slug[2], id: slug[3] },
        operation: 'update',
        dbalOp: { entity: slug[2], operation: 'update', id: slug[3] },
      })
      
      vi.mocked(getSessionUser).mockResolvedValue({
        user: { id: 'user1', role: 'user', tenantId: 'tenant1' },
      })
      
      vi.mocked(validatePackageRoute).mockReturnValue({
        allowed: true,
        package: { minLevel: 1 },
      })
      
      vi.mocked(validateTenantAccess).mockResolvedValue({
        allowed: true,
        tenant: { id: 'tenant1', name: 'Tenant 1' },
      })
      
      vi.mocked(executeDbalOperation).mockResolvedValue({
        success: true,
        data: { id: slug[3], ...body },
      })
      
      vi.mocked(successResponse).mockReturnValue({
        json: async () => ({ id: slug[3], ...body }),
        status: STATUS.OK,
      } as any)

      const request = new NextRequest(`http://localhost:3000/api/v1/${slug.join('/')}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
      const params = { params: Promise.resolve({ slug }) }

      await PUT(request, params)

      expect(executeDbalOperation).toHaveBeenCalled()
    })
  })

  describe('DELETE method', () => {
    it.each([
      {
        slug: ['tenant1', 'package1', 'entity1', 'id123'],
        expected: { status: 200 },
      },
    ])('should handle DELETE request for deleting entity', async ({ slug }) => {
      const { parseRestfulRequest, getSessionUser, validatePackageRoute, validateTenantAccess, executeDbalOperation, successResponse, STATUS } = await import('@/lib/routing')
      
      vi.mocked(parseRestfulRequest).mockReturnValue({
        route: { tenant: slug[0], package: slug[1], entity: slug[2], id: slug[3] },
        operation: 'delete',
        dbalOp: { entity: slug[2], operation: 'delete', id: slug[3] },
      })
      
      vi.mocked(getSessionUser).mockResolvedValue({
        user: { id: 'user1', role: 'admin', tenantId: 'tenant1' },
      })
      
      vi.mocked(validatePackageRoute).mockReturnValue({
        allowed: true,
        package: { minLevel: 1 },
      })
      
      vi.mocked(validateTenantAccess).mockResolvedValue({
        allowed: true,
        tenant: { id: 'tenant1', name: 'Tenant 1' },
      })
      
      vi.mocked(executeDbalOperation).mockResolvedValue({
        success: true,
        data: { success: true },
      })
      
      vi.mocked(successResponse).mockReturnValue({
        json: async () => ({ success: true }),
        status: STATUS.OK,
      } as any)

      const request = new NextRequest(`http://localhost:3000/api/v1/${slug.join('/')}`)
      const params = { params: Promise.resolve({ slug }) }

      await DELETE(request, params)

      expect(executeDbalOperation).toHaveBeenCalled()
    })
  })

  describe('Error handling', () => {
    it.each([
      {
        scenario: 'unauthorized user',
        user: null,
        expectedStatus: 401,
      },
      {
        scenario: 'insufficient permissions',
        user: { id: 'user1', role: 'user', tenantId: 'tenant1' },
        validateResult: { allowed: false, reason: 'Insufficient permissions' },
        expectedStatus: 403,
      },
    ])('should return $expectedStatus for $scenario', async ({ user, validateResult, expectedStatus }) => {
      const { parseRestfulRequest, getSessionUser, validatePackageRoute, errorResponse } = await import('@/lib/routing')
      
      vi.mocked(parseRestfulRequest).mockReturnValue({
        route: { tenant: 'tenant1', package: 'package1', entity: 'entity1' },
        operation: 'list',
        dbalOp: { entity: 'entity1', operation: 'list' },
      })
      
      vi.mocked(getSessionUser).mockResolvedValue({ user })
      
      vi.mocked(validatePackageRoute).mockReturnValue(
        validateResult ?? { allowed: true, package: { minLevel: 1 } }
      )
      
      vi.mocked(errorResponse).mockReturnValue({
        json: async () => ({ error: 'Access denied' }),
        status: expectedStatus,
      } as any)

      const request = new NextRequest('http://localhost:3000/api/v1/tenant1/package1/entity1')
      const params = { params: Promise.resolve({ slug: ['tenant1', 'package1', 'entity1'] }) }

      await GET(request, params)

      if (validateResult?.allowed === false) {
        expect(errorResponse).toHaveBeenCalledWith(
          expect.any(String),
          expectedStatus
        )
      }
    })

    it('should handle invalid JSON body', async () => {
      const { parseRestfulRequest, getSessionUser, validatePackageRoute, validateTenantAccess, errorResponse, STATUS } = await import('@/lib/routing')
      
      vi.mocked(parseRestfulRequest).mockReturnValue({
        route: { tenant: 'tenant1', package: 'package1', entity: 'entity1' },
        operation: 'create',
        dbalOp: { entity: 'entity1', operation: 'create' },
      })
      
      vi.mocked(getSessionUser).mockResolvedValue({
        user: { id: 'user1', role: 'user', tenantId: 'tenant1' },
      })
      
      vi.mocked(validatePackageRoute).mockReturnValue({
        allowed: true,
        package: { minLevel: 1 },
      })
      
      vi.mocked(validateTenantAccess).mockResolvedValue({
        allowed: true,
        tenant: { id: 'tenant1', name: 'Tenant 1' },
      })
      
      vi.mocked(errorResponse).mockReturnValue({
        json: async () => ({ error: 'Invalid JSON body' }),
        status: STATUS.BAD_REQUEST,
      } as any)

      const request = new NextRequest('http://localhost:3000/api/v1/tenant1/package1/entity1', {
        method: 'POST',
        body: 'invalid json{',
      })
      const params = { params: Promise.resolve({ slug: ['tenant1', 'package1', 'entity1'] }) }

      await POST(request, params)

      expect(errorResponse).toHaveBeenCalledWith('Invalid JSON body', STATUS.BAD_REQUEST)
    })
  })

  describe('Multi-tenant isolation', () => {
    it.each([
      {
        scenario: 'user accessing their tenant',
        user: { id: 'user1', role: 'user', tenantId: 'tenant1' },
        requestTenant: 'tenant1',
        allowed: true,
      },
      {
        scenario: 'god user accessing any tenant',
        user: { id: 'god1', role: 'god', tenantId: 'tenant1' },
        requestTenant: 'tenant2',
        allowed: true,
      },
    ])('should handle $scenario', async ({ user, requestTenant, allowed }) => {
      const { parseRestfulRequest, getSessionUser, validatePackageRoute, validateTenantAccess } = await import('@/lib/routing')
      
      vi.mocked(parseRestfulRequest).mockReturnValue({
        route: { tenant: requestTenant, package: 'package1', entity: 'entity1' },
        operation: 'list',
        dbalOp: { entity: 'entity1', operation: 'list' },
      })
      
      vi.mocked(getSessionUser).mockResolvedValue({ user })
      
      vi.mocked(validatePackageRoute).mockReturnValue({
        allowed: true,
        package: { minLevel: 1 },
      })
      
      vi.mocked(validateTenantAccess).mockResolvedValue({
        allowed,
        tenant: allowed ? { id: requestTenant, name: 'Tenant' } : null,
      })

      const request = new NextRequest(`http://localhost:3000/api/v1/${requestTenant}/package1/entity1`)
      const params = { params: Promise.resolve({ slug: [requestTenant, 'package1', 'entity1'] }) }

      await GET(request, params)

      expect(validateTenantAccess).toHaveBeenCalledWith(
        user,
        requestTenant,
        1
      )
    })
  })
})
