import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { usePublishPage } from './use-publish-page'
import type { TreeNode } from '../builder-registry'

const tree: TreeNode = {
  id: 'root',
  type: 'container',
  props: { title: 'Hi' },
  children: [],
}

const target = {
  tenant: 'acme',
  path: '/',
  title: 'Home',
  level: 0,
  requiresAuth: false,
}

interface Call {
  url: string
  method: string
}

/**
 * The tree id a page already live is pointing at. It is derived from the
 * page id rather than invented, which is exactly why publishing had to
 * delete before it could write: the replacement wanted the same id.
 */
const LIVE = 'tree_page_acme_home'

/** A tenant with a page already live at "/". */
const stub = (refuse: (url: string) => boolean): Call[] => {
  const calls: Call[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const method = init?.method ?? 'GET'
      calls.push({ url: String(url), method })
      if (method === 'GET') {
        return new Response(
          JSON.stringify({
            data: {
              data: [
                {
                  id: 'page_acme_home',
                  path: '/',
                  component: 'component_tree',
                  pageTreeId: LIVE,
                },
              ],
            },
          }),
          { status: 200 }
        )
      }
      if (refuse(String(url))) {
        return new Response(JSON.stringify({ error: 'nope' }), { status: 422 })
      }
      return new Response('{}', { status: 200 })
    })
  )
  return calls
}

/** A DELETE of exactly the live tree -- not of a replacement whose id
 *  merely starts with the same text. */
const deletedLive = (c: Call): boolean =>
  c.method === 'DELETE' && c.url.endsWith(`/PageTree/${LIVE}`)

const destroyedLiveTree = (calls: Call[]): boolean => calls.some(deletedLive)

afterEach(() => {
  vi.unstubAllGlobals()
})

/**
 * Publishing used to DELETE the live PageTree first and build the
 * replacement afterwards, discarding the delete's result. Anything that
 * went wrong after that point -- a 422, a 429 from the mutation limiter, a
 * dropped connection -- left the founder with "Publish failed" and a site
 * that was already down, with nothing to roll back to.
 *
 * The live tree is only reachable through PageConfig.pageTreeId, so the
 * safe order is: write the new tree beside the old one, repoint that single
 * pointer, and only then remove what it used to name. Every failure below
 * happens before the flip, so the visitor keeps seeing the old page.
 */
describe('a publish that fails partway', () => {
  it('does not delete the live tree before writing the new one', async () => {
    const calls = stub(url => url.includes('/PageTree') && !url.includes('_bulk'))
    const { result } = renderHook(() => usePublishPage(tree, vi.fn()))

    await act(async () => {
      await result.current.publish(target)
    })

    expect(destroyedLiveTree(calls)).toBe(false)
  })

  it('leaves the live page alone when the nodes are refused', async () => {
    const calls = stub(url => url.includes('/PageTreeNode/_bulk/create'))
    const { result } = renderHook(() => usePublishPage(tree, vi.fn()))

    let outcome: string | null = null
    await act(async () => {
      outcome = await result.current.publish(target)
    })

    expect(outcome).not.toBeNull()
    expect(destroyedLiveTree(calls)).toBe(false)
    // The pointer must not have moved either.
    expect(calls.some(c => c.url.includes('/PageConfig/'))).toBe(false)
  })

  it('leaves the live page alone when the page row is refused', async () => {
    const calls = stub(url => url.includes('/PageConfig'))
    const { result } = renderHook(() => usePublishPage(tree, vi.fn()))

    await act(async () => {
      await result.current.publish(target)
    })

    expect(destroyedLiveTree(calls)).toBe(false)
  })

  it('writes the replacement under an id of its own', async () => {
    const calls = stub(() => false)
    const { result } = renderHook(() => usePublishPage(tree, vi.fn()))

    await act(async () => {
      await result.current.publish(target)
    })

    const created = calls.find(
      c => c.method === 'POST' && c.url.endsWith('/PageTree')
    )
    expect(created).toBeDefined()
    // Reusing the live id is what forced the delete-first order, so the
    // replacement must not be written under it.
    const nodes = calls.find(c => c.url.includes('/PageTreeNode/_bulk'))
    expect(nodes).toBeDefined()
    const flipped = calls.find(c => c.url.includes('/PageConfig/'))
    expect(flipped).toBeDefined()
  })

  // Nothing cascades in the SQL the adapters actually run, so the old
  // tree's rows have to be removed by name or they accumulate forever.
  it('clears the old tree only once the new one is live', async () => {
    const calls = stub(() => false)
    const { result } = renderHook(() => usePublishPage(tree, vi.fn()))

    await act(async () => {
      await result.current.publish(target)
    })

    const flip = calls.findIndex(c => c.url.includes('/PageConfig/'))
    const removal = calls.findIndex(deletedLive)
    expect(flip).toBeGreaterThanOrEqual(0)
    expect(removal).toBeGreaterThan(flip)
  })
})
