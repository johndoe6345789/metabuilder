import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetchMod = vi.hoisted(() => ({ dbalFetch: vi.fn(), unwrap: vi.fn() }))
vi.mock('./dbal-fetch', () => fetchMod)

import { createOps } from './create-ops'
import { DBAL_URL, TENANT, PACKAGE } from './config'

beforeEach(() => {
  vi.clearAllMocks()
  fetchMod.dbalFetch.mockResolvedValue({ data: [] })
  fetchMod.unwrap.mockReturnValue({ data: [] })
})

describe('createOps', () => {
  it('routes through the default tenant when none is given', async () => {
    await createOps('User').list()
    expect(fetchMod.dbalFetch).toHaveBeenCalledWith(
      `${DBAL_URL}/${TENANT}/${PACKAGE}/User`
    )
  })

  it('routes through the given tenant when one is provided', async () => {
    await createOps('User', 'acme').list()
    expect(fetchMod.dbalFetch).toHaveBeenCalledWith(
      `${DBAL_URL}/acme/${PACKAGE}/User`
    )
  })

  it('threads the given tenant through create/read/update/remove too', async () => {
    fetchMod.dbalFetch.mockResolvedValue({})
    fetchMod.unwrap.mockReturnValue({})
    const ops = createOps('User', 'acme')

    await ops.read('u1')
    await ops.create({ username: 'x' })
    await ops.update('u1', { username: 'y' })
    await ops.remove('u1')

    for (const call of fetchMod.dbalFetch.mock.calls) {
      expect(String(call[0])).toContain(`${DBAL_URL}/acme/${PACKAGE}/User`)
    }
  })
})
