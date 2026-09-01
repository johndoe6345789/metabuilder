import { describe, expect, it } from 'vitest'
import { GET } from './route'

describe('GET /api/dbal/ping', () => {
  it('returns a 200 status ok payload', async () => {
    const res = GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ok')
  })

  it('includes an ISO timestamp', async () => {
    const res = GET()
    const body = await res.json()
    expect(typeof body.timestamp).toBe('string')
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp)
  })
})
