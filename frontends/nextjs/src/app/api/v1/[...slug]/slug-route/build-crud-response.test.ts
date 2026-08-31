import { describe, it, expect } from 'vitest'
import { buildCrudResponse } from './build-crud-response'

describe('buildCrudResponse', () => {
  it('answers 404 for a "not found" error message', async () => {
    const res = buildCrudResponse({ success: false, error: 'not found' }, 'read')
    expect(res.status).toBe(404)
  })

  it('answers 400 for a "required" error message', async () => {
    const res = buildCrudResponse(
      { success: false, error: 'name is required' },
      'create'
    )
    expect(res.status).toBe(400)
  })

  it('answers 500 for any other error message', async () => {
    const res = buildCrudResponse({ success: false, error: 'boom' }, 'read')
    expect(res.status).toBe(500)
  })

  it('answers 201 for a successful create', () => {
    const res = buildCrudResponse({ success: true, data: { id: '1' } }, 'create')
    expect(res.status).toBe(201)
  })

  it('answers 200 for a successful read', () => {
    const res = buildCrudResponse({ success: true, data: { id: '1' } }, 'read')
    expect(res.status).toBe(200)
  })

  it('merges meta alongside data rather than replacing it', async () => {
    const res = buildCrudResponse(
      { success: true, data: [{ id: '1' }], meta: { total: 1 } },
      'list'
    )
    const body = (await res.json()) as { total?: number }
    expect(body.total).toBe(1)
  })
})
