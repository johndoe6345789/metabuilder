import { afterEach, describe, expect, it, vi } from 'vitest'

const fetchMod = vi.hoisted(() => ({ entityApiFetch: vi.fn() }))
vi.mock('./entity-fetch', () => fetchMod)

import { fetchEntity } from './fetch-entity'

const answers = (body: unknown, ok = true, status = 200) => {
  fetchMod.entityApiFetch.mockResolvedValue({
    ok,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response)
}

afterEach(() => vi.clearAllMocks())

/**
 * The answer is an envelope, and this handed it back whole -- so the edit
 * form showed one field called "data" holding `{"data":[{"id":"u1"}]}`
 * and the detail page showed the same. Seen in a browser.
 */
describe('fetchEntity', () => {
  const row = { id: 'u1', username: 'rosa' }

  it.each([
    ['a bare row', row],
    ['one level', { data: row }],
    ['two levels', { data: { data: row } }],
    ['a one-row list', { data: { data: [row] } }],
  ])('reads the row out of %s', async (_shape, body) => {
    answers(body)
    expect((await fetchEntity('acme', 'core', 'User', 'u1')).data).toEqual(row)
  })

  it('asks for that row', async () => {
    answers(row)
    await fetchEntity('acme', 'core', 'User', 'u1')
    expect(fetchMod.entityApiFetch).toHaveBeenCalledWith(
      '/api/v1/acme/core/User/u1',
      expect.objectContaining({ method: 'GET' })
    )
  })

  it('is an empty record when the answer carries no row', async () => {
    answers({})
    expect((await fetchEntity('acme', 'core', 'User', 'u1')).data).toEqual({})
  })

  it('passes a refusal through untouched', async () => {
    answers({ error: 'Authentication required' }, false, 401)
    const result = await fetchEntity('acme', 'core', 'User', 'u1')
    expect(result.error).toBeDefined()
    expect(result.status).toBe(401)
  })
})
