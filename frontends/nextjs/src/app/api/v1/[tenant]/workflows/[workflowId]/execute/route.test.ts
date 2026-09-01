import { describe, expect, it } from 'vitest'
import { GET, POST } from './route'

const params = (over: Partial<{ tenant: string; workflowId: string }> = {}) =>
  ({
    params: Promise.resolve({
      tenant: 'acme',
      workflowId: 'wf-1',
      ...over,
    }),
  }) as never

const req = () =>
  new Request('http://localhost/api/v1/acme/workflows/wf-1/execute', {
    method: 'POST',
  }) as never

describe('POST /api/v1/[tenant]/workflows/[workflowId]/execute', () => {
  it('reports not-yet-implemented with a 501 status', async () => {
    const res = await POST(req(), params())

    expect(res.status).toBe(501)
    const body = await res.json()
    expect(body.error).toBe('Workflow execution not yet implemented')
    expect(body.hint).toContain('Phase 5')
  })

  it('resolves the route params without throwing', async () => {
    const res = await POST(req(), params({ workflowId: 'other-wf' }))
    expect(res.status).toBe(501)
  })

  it('returns a 500 when the route params reject', async () => {
    const badParams = {
      params: Promise.reject(new Error('bad params')),
    } as never

    const res = await POST(req(), badParams)

    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('Internal server error')
  })
})

describe('GET /api/v1/[tenant]/workflows/[workflowId]/execute', () => {
  it('also reports not-yet-implemented with a 501 status', () => {
    const res = GET(req(), params())

    expect(res.status).toBe(501)
  })

  it('includes a descriptive message', async () => {
    const res = GET(req(), params())
    const body = await res.json()
    expect(body.message).toContain('@metabuilder/workflow')
  })
})
