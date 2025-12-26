import { describe, expect, it } from 'vitest'

import { GET, POST } from './route'

describe('GET /api/levels', () => {
  it('returns every permission level when no filter is provided', async () => {
    const response = await GET(new Request('http://example.com/api/levels'))
    const payload = await response.json()

    expect(response.headers.get('content-type')).toContain('application/json')
    expect(payload.levels).toHaveLength(5)
  })

  it('filters results by level key', async () => {
    const response = await GET(new Request('http://example.com/api/levels?level=supergod'))
    const payload = await response.json()

    expect(payload.levels).toHaveLength(1)
    expect(payload.levels[0].key).toBe('supergod')
  })

  it('filters results by capability keyword', async () => {
    const response = await GET(new Request('http://example.com/api/levels?cap=front page'))
    const payload = await response.json()

    expect(payload.levels.length).toBeGreaterThan(0)
    expect(payload.levels.some((level) => level.key === 'god')).toBe(true)
  })

  it('accepts level feedback via POST', async () => {
    const response = await POST(
      new Request('http://example.com/api/levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: 'God', note: 'Need more widgets' }),
      })
    )
    const payload = await response.json()

    expect(payload.acknowledged).toBe(true)
    expect(payload.level.key).toBe('god')
  })
})
