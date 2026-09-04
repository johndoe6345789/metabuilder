import { afterEach, describe, expect, it, vi } from 'vitest'
import { saveTree, type TreeNodeShape } from '@/lib/tenant/page-tree'

const DBAL = 'http://dbal.test'

const tree = (over: Partial<TreeNodeShape> = {}): TreeNodeShape => ({
  id: 'root',
  type: 'html.section',
  props: {},
  children: [],
  ...over,
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('saveTree', () => {
  it('deletes the old tree before writing the new one', async () => {
    const calls: { url: string; method: string }[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        calls.push({ url, method: init?.method ?? 'GET' })
        return new Response('{}', { status: 200 })
      })
    )

    await saveTree(DBAL, 'acme', 'tree_1', 'Home', tree())

    expect(calls[0]).toMatchObject({
      url: `${DBAL}/acme/core/PageTree/tree_1`,
      method: 'DELETE',
    })
  })

  it('writes the root node and its props', async () => {
    const calls: { url: string; body: string }[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        calls.push({ url, body: String(init?.body ?? '') })
        return new Response('{}', { status: 200 })
      })
    )

    const ok = await saveTree(
      DBAL,
      'acme',
      'tree_1',
      'Home',
      tree({ props: { title: 'Hi' } })
    )

    expect(ok).toBe(true)
    expect(calls.some(c => c.url.endsWith('/PageTreeNode'))).toBe(true)
    expect(
      calls.some(c => c.url.endsWith('/PageTreeProp') && c.body.includes('Hi'))
    ).toBe(true)
  })

  /**
   * DBAL's PageTreeProp schema requires sortOrder, and omitting it made every
   * publish fail at the first prop with a 422 -- "Validation failed: sortOrder
   * Field is required". The node write always sent one; the prop write never
   * did, so a page with any property on any node could not be published at
   * all. Props reassemble by name, so the value only has to exist and be
   * stable; the index is that.
   */
  it('sends a sortOrder on every prop row, as the schema requires', async () => {
    const props: Record<string, unknown>[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        if (String(url).endsWith('/PageTreeProp')) {
          props.push(JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>)
        }
        return new Response('{}', { status: 200 })
      })
    )

    await saveTree(
      DBAL,
      'acme',
      'tree_1',
      'Home',
      tree({ props: { title: 'Hi', subtitle: 'There' } })
    )

    expect(props).toHaveLength(2)
    expect(props.map(p => p.sortOrder)).toEqual([0, 1])
  })
})
