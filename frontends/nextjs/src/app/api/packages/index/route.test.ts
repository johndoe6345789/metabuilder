import { beforeEach, describe, expect, it, vi } from 'vitest'
import type * as Routing from '@/lib/routing'

const session = vi.hoisted(() => ({ getSessionUser: vi.fn() }))
const fs = vi.hoisted(() => ({ readFile: vi.fn() }))

vi.mock('@/lib/routing', async importOriginal => {
  const actual = await importOriginal<typeof Routing>()
  return { ...actual, getSessionUser: session.getSessionUser }
})
vi.mock('fs/promises', () => ({ ...fs, default: fs }))

import { GET } from './route'

beforeEach(() => {
  vi.clearAllMocks()
  session.getSessionUser.mockResolvedValue({ user: { id: 'u1' } })
})

describe('GET /api/packages/index', () => {
  it('is 401 with no session', async () => {
    session.getSessionUser.mockResolvedValue({ user: null })
    const res = await GET(new Request('http://localhost/x'))
    expect(res.status).toBe(401)
  })

  it('returns the parsed index on success', async () => {
    fs.readFile.mockResolvedValue(JSON.stringify({ packages: ['blog'] }))
    const res = await GET(new Request('http://localhost/x'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ packages: ['blog'] })
  })

  it('sets a cache-control header on success', async () => {
    fs.readFile.mockResolvedValue(JSON.stringify({ packages: [] }))
    const res = await GET(new Request('http://localhost/x'))
    expect(res.headers.get('Cache-Control')).toContain('max-age=60')
  })

  it('is 500 with an empty package list when the file is missing', async () => {
    fs.readFile.mockRejectedValue(new Error('ENOENT'))
    const res = await GET(new Request('http://localhost/x'))
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({
      packages: [],
      error: 'Failed to load package index',
    })
  })

  it('is 500 for malformed JSON', async () => {
    fs.readFile.mockResolvedValue('{not json')
    const res = await GET(new Request('http://localhost/x'))
    expect(res.status).toBe(500)
  })
})
