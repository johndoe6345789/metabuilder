import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetchMod = vi.hoisted(() => ({
  dbalFetch: vi.fn(),
  unwrap: (raw: unknown) => raw,
}))
vi.mock('../dbal-fetch', () => fetchMod)

import { listEntity } from './list'

beforeEach(() => {
  vi.clearAllMocks()
})

/**
 * A list that cannot be read answers `{ data: [] }`, which is the same
 * thing it says when the table really is empty. Every caller that uses a
 * list as a *guard* therefore fails open: registration's "is this
 * community name taken" check reads a DBAL timeout as "nobody has it", and
 * then creates the account as a god inside somebody else's tenant.
 *
 * The swallow itself is deliberate and stays -- a page list going briefly
 * empty during an outage is better than a crash. What was missing is the
 * ability to tell the two apart.
 */
describe('a list that could not be read', () => {
  it('says so, rather than looking like an empty table', async () => {
    fetchMod.dbalFetch.mockRejectedValue(new Error('ECONNREFUSED'))

    const result = await listEntity('http://dbal/acme/core/User')

    expect(result.data).toEqual([])
    expect(result.failed).toBe(true)
  })

  it('does not mark a genuinely empty table as failed', async () => {
    fetchMod.dbalFetch.mockResolvedValue({ data: [] })

    const result = await listEntity('http://dbal/acme/core/User')

    expect(result.data).toEqual([])
    expect(result.failed).toBeFalsy()
  })

  it('does not mark a list that returned rows as failed', async () => {
    fetchMod.dbalFetch.mockResolvedValue({ data: [{ id: 'u1' }] })

    const result = await listEntity('http://dbal/acme/core/User')

    expect(result.data).toHaveLength(1)
    expect(result.failed).toBeFalsy()
  })
})
