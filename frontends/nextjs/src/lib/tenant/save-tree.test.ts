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
})
