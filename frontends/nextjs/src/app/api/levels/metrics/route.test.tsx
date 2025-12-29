import { describe, expect, it } from 'vitest'

import { GET } from './route'

describe('GET /api/levels/metrics', () => {
  it('returns a summary for every permission level', async () => {
    const response = await GET(new Request('http://example.com/api/levels/metrics'))
    const payload = await response.json()

    expect(payload.totalLevels).toBeGreaterThan(0)
    expect(Array.isArray(payload.summary)).toBe(true)
    expect(payload.summary.every((entry: any) => typeof entry.capabilityCount === 'number')).toBe(
      true
    )
  })
})
