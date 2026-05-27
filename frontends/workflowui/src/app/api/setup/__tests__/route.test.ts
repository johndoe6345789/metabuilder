/**
 * Tests for /api/setup route
 */

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data: any, opts?: any) => ({
      json: () => Promise.resolve(data),
      status: opts?.status ?? 200,
    })),
  },
}))

global.fetch = jest.fn()

import { POST } from '../route'

describe('POST /api/setup', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return success when all seeds succeed', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, json: () => ({}) })
    const response = await POST()
    const data = await response.json()
    expect(data.success).toBe(true)
  })

  it('should return success message on full success', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, json: () => ({}) })
    const response = await POST()
    const data = await response.json()
    expect(data.message).toBe('Database seeded successfully')
  })

  it('should count seeded packages', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, json: () => ({}) })
    const response = await POST()
    const data = await response.json()
    expect(data.results.packages).toBeGreaterThan(0)
  })

  it('should count seeded pages', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, json: () => ({}) })
    const response = await POST()
    const data = await response.json()
    expect(data.results.pages).toBeGreaterThan(0)
  })

  it('should count skipped when 409 status', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 409 })
    const response = await POST()
    const data = await response.json()
    expect(data.results.skipped).toBeGreaterThan(0)
  })

  it('should count errors when non-409 failure', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 })
    const response = await POST()
    const data = await response.json()
    expect(data.results.errors).toBeGreaterThan(0)
  })

  it('should return error message when there are errors', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 })
    const response = await POST()
    const data = await response.json()
    expect(data.message).toContain('error')
    expect(data.success).toBe(false)
  })

  it('should handle network errors gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
    const response = await POST()
    const data = await response.json()
    expect(data.results.errors).toBeGreaterThan(0)
    expect(data.success).toBe(false)
  })

  it('should return results with all fields', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: true, status: 200 })
    const response = await POST()
    const data = await response.json()
    expect(data.results).toHaveProperty('packages')
    expect(data.results).toHaveProperty('pages')
    expect(data.results).toHaveProperty('skipped')
    expect(data.results).toHaveProperty('errors')
  })
})
