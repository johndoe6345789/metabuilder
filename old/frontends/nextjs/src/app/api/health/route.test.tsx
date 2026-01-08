import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'

import { GET } from './route'

describe('GET /api/health', () => {
  it('returns OK status and timestamp', async () => {
    const response = GET(new NextRequest('http://example.com/api/health'))
    const payload = await response.json() as Record<string, unknown>

    expect(payload.status).toBe('ok')
    expect(typeof payload.timestamp).toBe('string')
    // Health endpoint should not expose internal system details
    expect(payload.levelCount).toBeUndefined()
  })
})
