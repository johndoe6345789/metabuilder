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

describe('saveTree write order', () => {
  // The rows go in one bulk request now, so the ordering that matters is
  // the order within its array: a child must not appear before the parent
  // it points at, or the insert violates the foreign key.
  it('writes children after their parent, in order', async () => {
    let nodeIds: string[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.endsWith('/PageTreeNode/_bulk/create')) {
          const rows = JSON.parse(String(init?.body)) as { id: string }[]
          nodeIds = rows.map(r => r.id)
        }
        return new Response('{}', { status: 200 })
      })
    )

    await saveTree(
      DBAL,
      'acme',
      'tree_1',
      'Home',
      tree({
        children: [
          tree({ id: 'a', children: [] }),
          tree({ id: 'b', children: [] }),
        ],
      })
    )

    expect(nodeIds).toEqual(['tree_1__root', 'tree_1__a', 'tree_1__b'])
  })
})
