import { beforeEach, describe, expect, it, vi } from 'vitest'

const fs = vi.hoisted(() => ({ readFileSync: vi.fn() }))
vi.mock('fs', () => ({ ...fs, default: fs }))

import { GET } from './route'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/docs/openapi', () => {
  it('returns the parsed spec with caching/CORS headers', async () => {
    fs.readFileSync.mockReturnValue(JSON.stringify({ openapi: '3.0.0' }))

    const res = GET()

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ openapi: '3.0.0' })
    expect(res.headers.get('Cache-Control')).toContain('max-age=3600')
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
  })

  it('is 500 with the error message when the file is missing', async () => {
    fs.readFileSync.mockImplementation(() => {
      throw new Error('ENOENT')
    })
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const res = GET()

    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({
      error: 'Failed to load API specification',
      message: 'ENOENT',
    })
    spy.mockRestore()
  })

  it('is 500 for malformed JSON', async () => {
    fs.readFileSync.mockReturnValue('{not json')
    const res = GET()
    expect(res.status).toBe(500)
  })
})
