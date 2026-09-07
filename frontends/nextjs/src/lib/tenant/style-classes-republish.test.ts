import { afterEach, describe, expect, it, vi } from 'vitest'

import { saveStyleClasses } from './style-classes'

const cls = (id: string) => ({ id, name: id, props: { color: 'red' } })

interface Call {
  url: string
  method: string
}

const stub = (): Call[] => {
  const calls: Call[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url: String(url), method: init?.method ?? 'GET' })
      return new Response('{}', { status: 200 })
    })
  )
  return calls
}

afterEach(() => {
  vi.unstubAllGlobals()
})

/**
 * Publishing a stylesheet deleted the StyleClass row and rebuilt under the
 * same id, on the stated assumption that the delete "cascades its rules and
 * their declarations away". Nothing cascades -- the SQL the live adapters
 * run emits no FOREIGN KEY, only the Prisma generator reads on_delete -- so
 * every StyleRule and StyleRuleProp survived.
 *
 * Rule ids are deterministic (`${sheetId}__${ruleKey}`) and the rows go in
 * through _bulk/create, which refuses the whole batch on the first
 * conflicting id. So the second publish and every one after it failed: the
 * founder's site kept serving the first version of its CSS forever, and a
 * class they deleted never stopped rendering.
 */
describe('publishing a stylesheet a second time', () => {
  const removals = (calls: Call[]) =>
    calls.filter(c => c.method === 'DELETE').map(c => c.url)

  it('clears the rules and their props, not just the sheet row', async () => {
    const calls = stub()

    await saveStyleClasses('http://dbal', 'acme', [cls('hero')])

    const urls = removals(calls).join(' ')
    expect(urls).toContain('StyleRuleProp')
    expect(urls).toContain('StyleRule')
  })

  it('clears them before writing the replacements', async () => {
    const calls = stub()

    await saveStyleClasses('http://dbal', 'acme', [cls('hero')])

    const lastDelete = calls.map(c => c.method).lastIndexOf('DELETE')
    const firstBulk = calls.findIndex(c => c.url.includes('_bulk/create'))
    expect(firstBulk).toBeGreaterThan(lastDelete)
  })

  it('scopes the removal to this tenant sheet', async () => {
    const calls = stub()

    await saveStyleClasses('http://dbal', 'acme', [cls('hero')])

    for (const url of removals(calls)) {
      expect(url).toContain('/acme/')
    }
    expect(removals(calls).some(u => u.includes('styles_acme'))).toBe(true)
  })
})
