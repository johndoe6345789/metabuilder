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

describe('saveTree failure paths', () => {
  it('gives up as soon as a node write fails', async () => {
    let treeCreated = false
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        if (init?.method === 'DELETE') return new Response('{}')
        if (url.endsWith('/PageTree')) {
          treeCreated = true
          return new Response('{}', { status: 200 })
        }
        return new Response('', { status: 500 })
      })
    )

    const failure = await saveTree(DBAL, 'acme', 'tree_1', 'Home', tree())

    expect(treeCreated).toBe(true)
    expect(failure).toMatch(/PageTreeNode rejected \(500\)/)
  })

  it('writes nothing when creating the tree row itself fails', async () => {
    const calls: string[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        calls.push(url)
        if (init?.method === 'DELETE') return new Response('{}')
        return new Response('', { status: 500 })
      })
    )

    const failure = await saveTree(DBAL, 'acme', 'tree_1', 'Home', tree())

    expect(failure).toMatch(/PageTree rejected \(500\)/)
    expect(calls.some(u => u.includes('/PageTreeNode'))).toBe(false)
  })
})
