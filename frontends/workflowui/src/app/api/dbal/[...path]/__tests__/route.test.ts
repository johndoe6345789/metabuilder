/**
 * Tests for DBAL API proxy route
 */

jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    url: string
    method: string
    headers: any
    nextUrl: any
    _body: string

    constructor(url: string, init?: any) {
      this.url = url
      this.method = init?.method || 'GET'
      this.headers = new Map(Object.entries(init?.headers || {}))
      this.headers.get = (key: string) =>
        init?.headers?.[key.toLowerCase()] ?? null
      this._body = init?.body || ''
      this.nextUrl = {
        searchParams: {
          toString: () => '',
        },
      }
    }

    async text() {
      return this._body
    }
  },
  NextResponse: {
    json: jest.fn((data: any, opts?: any) => ({
      json: () => Promise.resolve(data),
      status: opts?.status ?? 200,
    })),
  },
}))

global.fetch = jest.fn()

import { GET, POST, PUT, PATCH, DELETE } from '../route'
import { NextRequest } from 'next/server'

const makeRequest = (url = 'http://localhost:3000/api/dbal/tenant/core/user', method = 'GET', body = '') => {
  return new NextRequest(url, { method, body })
}

const makeContext = (path = ['tenant', 'core', 'user']) => ({
  params: Promise.resolve({ path }),
})

describe('DBAL Proxy Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should proxy GET request to DBAL', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: [] }),
      })
      const request = makeRequest()
      const context = makeContext()
      const response = await GET(request as any, context)
      expect(global.fetch).toHaveBeenCalled()
    })

    it('should return proxied data', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ items: [{ id: '1' }] }),
      })
      const response = await GET(makeRequest() as any, makeContext())
      const data = await response.json()
      expect(data).toEqual({ items: [{ id: '1' }] })
    })

    it('should handle fetch errors and return 500', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Connection refused'))
      const response = await GET(makeRequest() as any, makeContext())
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.message).toBe('Connection refused')
    })
  })

  describe('POST', () => {
    it('should proxy POST request with body', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ id: 'new-id' }),
      })
      const request = makeRequest('http://localhost/api/dbal/t/c/e', 'POST', '{"name":"test"}')
      const response = await POST(request as any, makeContext())
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('should handle POST errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Timeout'))
      const response = await POST(makeRequest('', 'POST') as any, makeContext())
      const data = await response.json()
      expect(data.success).toBe(false)
    })
  })

  describe('PUT', () => {
    it('should proxy PUT request', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ updated: true }),
      })
      const response = await PUT(makeRequest('', 'PUT', '{"name":"updated"}') as any, makeContext())
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'PUT' })
      )
    })
  })

  describe('PATCH', () => {
    it('should proxy PATCH request', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ patched: true }),
      })
      const response = await PATCH(makeRequest('', 'PATCH', '{"field":"value"}') as any, makeContext())
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'PATCH' })
      )
    })
  })

  describe('DELETE', () => {
    it('should proxy DELETE request', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 204,
        json: () => Promise.resolve({}),
      })
      const response = await DELETE(makeRequest('', 'DELETE') as any, makeContext())
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'DELETE' })
      )
    })
  })

  describe('Authorization forwarding', () => {
    it('should forward authorization header when present', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      })
      const request = makeRequest()
      request.headers.get = (key: string) => key === 'authorization' ? 'Bearer token123' : null
      await GET(request as any, makeContext())
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer token123',
          }),
        })
      )
    })
  })
})
