import { afterEach, describe, expect, it, vi } from 'vitest'

import { loadTree } from '@/lib/tenant/page-tree'

const DBAL = 'http://dbal.test'
const rows = (data: unknown[]) =>
  new Response(JSON.stringify({ data: { data } }), { status: 200 })

const stub = (nodes: unknown[], props: unknown[] = []) => {
  vi.stubGlobal('fetch', (url: string) =>
    Promise.resolve(url.includes('PageTreeProp') ? rows(props) : rows(nodes))
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('loadTree', () => {
  it('returns null when the tree has no rows', async () => {
    stub([])
    await expect(loadTree(DBAL, 'system', 't1')).resolves.toBeNull()
  })

  it('rebuilds parents and children from parentId', async () => {
    stub([
      { id: 'root', parentId: null, type: 'container', sortOrder: 0 },
      { id: 'a', parentId: 'root', type: 'html.p', sortOrder: 0 },
      { id: 'b', parentId: 'root', type: 'html.p', sortOrder: 1 },
    ])

    const tree = await loadTree(DBAL, 'system', 't1')

    expect(tree?.id).toBe('root')
    expect(tree?.children.map(c => c.id)).toEqual(['a', 'b'])
  })

  it('orders siblings by sortOrder, not by the order rows arrive', async () => {
    stub([
      { id: 'root', parentId: null, type: 'container', sortOrder: 0 },
      { id: 'second', parentId: 'root', type: 'html.p', sortOrder: 1 },
      { id: 'first', parentId: 'root', type: 'html.p', sortOrder: 0 },
    ])

    const tree = await loadTree(DBAL, 'system', 't1')

    expect(tree?.children.map(c => c.id)).toEqual(['first', 'second'])
  })

  it('attaches properties to the node they belong to', async () => {
    stub(
      [{ id: 'root', parentId: null, type: 'container', sortOrder: 0 }],
      [{ nodeId: 'root', name: 'gap', value: '12', valueType: 'number' }]
    )

    const tree = await loadTree(DBAL, 'system', 't1')

    // The stored type decides what comes back, so a number stays a number.
    expect(tree?.props.gap).toBe(12)
  })
})
