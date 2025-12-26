import { describe, expect, it } from 'vitest'

import { GET } from './route'

describe('GET /api/health', () => {
  it('returns OK status and permission level count', async () => {
    const response = await GET(new Request('http://example.com/api/health'))
    const payload = await response.json()

    expect(payload.status).toBe('ok')
    expect(typeof payload.timestamp).toBe('string')
    expect(payload.levelCount).toBeGreaterThan(0)
  })
})
