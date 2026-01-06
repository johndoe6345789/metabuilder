import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'

import { GET } from './route'

describe('GET /api/health', () => {
  it('returns OK status and permission level count', async () => {
    const response = GET(new NextRequest('http://example.com/api/health'))
    const payload = await response.json() as Record<string, unknown>

    expect(payload.status).toBe('ok')
    expect(typeof payload.timestamp).toBe('string')
    expect(payload.levelCount).toBeGreaterThan(0)
  })
})
