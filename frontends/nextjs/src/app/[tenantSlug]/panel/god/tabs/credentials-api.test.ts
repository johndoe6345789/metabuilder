import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchAccounts } from './credentials-api'

const asked = (): string[] => {
  const urls: string[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      urls.push(String(url))
      return new Response(JSON.stringify({ data: { data: [] } }), {
        status: 200,
      })
    })
  )
  return urls
}

afterEach(() => vi.unstubAllGlobals())

/**
 * This asked /system/core/User with ?filter.tenantId=<scope>. DBAL scopes
 * by the URL's tenant and ignores filter.tenantId, so every founder was
 * handed the system tenant's users over the wire -- and the client-side
 * scope filter then discarded all of them. Their own members live at
 * /{tenant}/core/User and were never fetched: the tab was always empty.
 */
describe('which community’s accounts the credentials tab asks for', () => {
  it('asks the founder’s own community, not the shared one', async () => {
    const urls = asked()
    await fetchAccounts('harbour_cycle_works', false)

    expect(urls[0]).toContain('/harbour_cycle_works/core/User')
    expect(urls[0]).not.toContain('/system/')
  })

  it('does not lean on a filter the data layer ignores', async () => {
    const urls = asked()
    await fetchAccounts('harbour_cycle_works', false)

    expect(urls[0]).not.toContain('filter.tenantId')
  })
})
