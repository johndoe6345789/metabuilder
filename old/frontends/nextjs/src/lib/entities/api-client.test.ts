/**
 * Unit tests for API client utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock server-only module
vi.mock('server-only', () => ({}))

import {
  fetchEntityList,
  fetchEntity,
  createEntity,
  updateEntity,
  deleteEntity,
  type ListQueryParams,
} from './api-client'

// Mock fetch
global.fetch = vi.fn()

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('fetchEntityList', () => {
    it.each([
      {
        name: 'successful list request',
        tenant: 'acme',
        pkg: 'forum',
        entity: 'posts',
        params: {},
        mockResponse: { data: [{ id: '1' }, { id: '2' }] },
        mockStatus: 200,
        expectedData: [{ id: '1' }, { id: '2' }],
        expectedStatus: 200,
      },
      {
        name: 'list with pagination',
        tenant: 'acme',
        pkg: 'forum',
        entity: 'posts',
        params: { page: 2, limit: 10 },
        mockResponse: { data: [{ id: '11' }] },
        mockStatus: 200,
        expectedData: [{ id: '11' }],
        expectedStatus: 200,
      },
      {
        name: 'list with filter',
        tenant: 'acme',
        pkg: 'forum',
        entity: 'posts',
        params: { filter: { published: true } },
        mockResponse: { data: [{ id: '1', published: true }] },
        mockStatus: 200,
        expectedData: [{ id: '1', published: true }],
        expectedStatus: 200,
      },
      {
        name: 'list with sort',
        tenant: 'acme',
        pkg: 'forum',
        entity: 'posts',
        params: { sort: 'createdAt' },
        mockResponse: { data: [{ id: '3' }, { id: '1' }] },
        mockStatus: 200,
        expectedData: [{ id: '3' }, { id: '1' }],
        expectedStatus: 200,
      },
      {
        name: 'empty list response',
        tenant: 'acme',
        pkg: 'forum',
        entity: 'posts',
        params: {},
        mockResponse: { data: [] },
        mockStatus: 200,
        expectedData: [],
        expectedStatus: 200,
      },
    ])('should handle $name', async ({ tenant, pkg, entity, params, mockResponse, mockStatus, expectedData, expectedStatus }) => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: mockStatus,
        json: () => mockResponse,
      } as unknown as Response)

      const result = await fetchEntityList(tenant, pkg, entity, params as ListQueryParams)

      expect(result.status).toBe(expectedStatus)
      expect(result.data).toEqual(expectedData)
      expect(result.error).toBeUndefined()
    })

    it.each([
      {
        name: '404 not found',
        mockStatus: 404,
        mockError: 'Entity not found',
        expectedError: 'Entity not found',
      },
      {
        name: '401 unauthorized',
        mockStatus: 401,
        mockError: 'Unauthorized',
        expectedError: 'Unauthorized',
      },
      {
        name: '403 forbidden',
        mockStatus: 403,
        mockError: 'Forbidden',
        expectedError: 'Forbidden',
      },
      {
        name: '500 server error',
        mockStatus: 500,
        mockError: 'Internal server error',
        expectedError: 'Internal server error',
      },
    ])('should handle $name error', async ({ mockStatus, mockError, expectedError }) => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: mockStatus,
        json: () => ({ error: mockError }),
      } as unknown as Response)

      const result = await fetchEntityList('acme', 'forum', 'posts')

      expect(result.status).toBe(mockStatus)
      expect(result.error).toBe(expectedError)
      expect(result.data).toBeUndefined()
    })

    it('should handle network errors', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      const result = await fetchEntityList('acme', 'forum', 'posts')

      expect(result.status).toBe(500)
      expect(result.error).toBe('Network error')
    })
  })

  describe('fetchEntity', () => {
    it.each([
      {
        name: 'successful fetch',
        tenant: 'acme',
        pkg: 'forum',
        entity: 'posts',
        id: '123',
        mockResponse: { id: '123', title: 'Test Post' },
        mockStatus: 200,
        expectedData: { id: '123', title: 'Test Post' },
      },
    ])('should handle $name', async ({ tenant, pkg, entity, id, mockResponse, mockStatus, expectedData }) => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: mockStatus,
        json: () => mockResponse,
      } as unknown as Response)

      const result = await fetchEntity(tenant, pkg, entity, id)

      expect(result.status).toBe(mockStatus)
      expect(result.data).toEqual(expectedData)
      expect(result.error).toBeUndefined()
    })

    it.each([
      {
        name: '404 entity not found',
        mockStatus: 404,
        mockError: 'Entity not found',
      },
      {
        name: '401 unauthorized',
        mockStatus: 401,
        mockError: 'Unauthorized',
      },
    ])('should handle $name error', async ({ mockStatus, mockError }) => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: mockStatus,
        json: () => ({ error: mockError }),
      } as unknown as Response)

      const result = await fetchEntity('acme', 'forum', 'posts', '123')

      expect(result.status).toBe(mockStatus)
      expect(result.error).toBe(mockError)
    })
  })

  describe('createEntity', () => {
    it.each([
      {
        name: 'successful create',
        tenant: 'acme',
        pkg: 'forum',
        entity: 'posts',
        data: { title: 'New Post', content: 'Content' },
        mockResponse: { id: 'new-123', title: 'New Post', content: 'Content' },
        mockStatus: 201,
        expectedStatus: 201,
      },
    ])('should handle $name', async ({ tenant, pkg, entity, data, mockResponse, mockStatus, expectedStatus }) => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: mockStatus,
        json: () => mockResponse,
      } as unknown as Response)

      const result = await createEntity(tenant, pkg, entity, data)

      expect(result.status).toBe(expectedStatus)
      expect(result.data).toEqual(mockResponse)
      expect(result.error).toBeUndefined()
    })

    it.each([
      {
        name: '400 validation error',
        mockStatus: 400,
        mockError: 'Title is required',
      },
      {
        name: '401 unauthorized',
        mockStatus: 401,
        mockError: 'Unauthorized',
      },
      {
        name: '403 forbidden',
        mockStatus: 403,
        mockError: 'Forbidden',
      },
    ])('should handle $name error', async ({ mockStatus, mockError }) => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: mockStatus,
        json: () => ({ error: mockError }),
      } as unknown as Response)

      const result = await createEntity('acme', 'forum', 'posts', { title: '' })

      expect(result.status).toBe(mockStatus)
      expect(result.error).toBe(mockError)
    })
  })

  describe('updateEntity', () => {
    it.each([
      {
        name: 'successful update',
        tenant: 'acme',
        pkg: 'forum',
        entity: 'posts',
        id: '123',
        data: { title: 'Updated Title' },
        mockResponse: { id: '123', title: 'Updated Title' },
        mockStatus: 200,
      },
      {
        name: 'partial update',
        tenant: 'acme',
        pkg: 'forum',
        entity: 'posts',
        id: '123',
        data: { content: 'New content' },
        mockResponse: { id: '123', title: 'Old Title', content: 'New content' },
        mockStatus: 200,
      },
    ])('should handle $name', async ({ tenant, pkg, entity, id, data, mockResponse, mockStatus }) => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: mockStatus,
        json: () => mockResponse,
      } as unknown as Response)

      const result = await updateEntity(tenant, pkg, entity, id, data)

      expect(result.status).toBe(mockStatus)
      expect(result.data).toEqual(mockResponse)
      expect(result.error).toBeUndefined()
    })

    it.each([
      {
        name: '404 entity not found',
        mockStatus: 404,
        mockError: 'Entity not found',
      },
      {
        name: '400 validation error',
        mockStatus: 400,
        mockError: 'Invalid data',
      },
    ])('should handle $name error', async ({ mockStatus, mockError }) => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: mockStatus,
        json: () => ({ error: mockError }),
      } as unknown as Response)

      const result = await updateEntity('acme', 'forum', 'posts', '123', {})

      expect(result.status).toBe(mockStatus)
      expect(result.error).toBe(mockError)
    })
  })

  describe('deleteEntity', () => {
    it('should handle successful delete', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => ({}),
      } as unknown as Response)

      const result = await deleteEntity('acme', 'forum', 'posts', '123')

      expect(result.status).toBe(200)
      expect(result.error).toBeUndefined()
    })

    it.each([
      {
        name: '404 entity not found',
        mockStatus: 404,
        mockError: 'Entity not found',
      },
      {
        name: '401 unauthorized',
        mockStatus: 401,
        mockError: 'Unauthorized',
      },
      {
        name: '403 forbidden',
        mockStatus: 403,
        mockError: 'Forbidden',
      },
    ])('should handle $name error', async ({ mockStatus, mockError }) => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: mockStatus,
        json: () => ({ error: mockError }),
      } as unknown as Response)

      const result = await deleteEntity('acme', 'forum', 'posts', '123')

      expect(result.status).toBe(mockStatus)
      expect(result.error).toBe(mockError)
    })
  })

  describe('query string building', () => {
    it('should build correct query string for pagination', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => ({ data: [] }),
      } as unknown as Response)

      await fetchEntityList('acme', 'forum', 'posts', { page: 2, limit: 20 })

      expect(fetch).toHaveBeenCalledWith(
        '/api/v1/acme/forum/posts?page=2&limit=20',
        expect.any(Object)
      )
    })

    it('should build correct query string for filter', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => ({ data: [] }),
      } as unknown as Response)

      await fetchEntityList('acme', 'forum', 'posts', {
        filter: { published: true, author: 'john' },
      })

      const call = vi.mocked(fetch).mock.calls[0]
      expect(call?.[0]).toContain('/api/v1/acme/forum/posts?')
      expect(call?.[0]).toContain('filter=')
    })

    it('should build correct query string for sort', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => ({ data: [] }),
      } as unknown as Response)

      await fetchEntityList('acme', 'forum', 'posts', { sort: '-createdAt' })

      expect(fetch).toHaveBeenCalledWith(
        '/api/v1/acme/forum/posts?sort=-createdAt',
        expect.any(Object)
      )
    })

    it('should handle empty params', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => ({ data: [] }),
      } as unknown as Response)

      await fetchEntityList('acme', 'forum', 'posts', {})

      expect(fetch).toHaveBeenCalledWith(
        '/api/v1/acme/forum/posts',
        expect.any(Object)
      )
    })
  })
})
