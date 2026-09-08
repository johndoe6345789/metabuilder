import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { usePublishPage } from './use-publish-page'
import type { TreeNode } from '../builder-registry'

const tree: TreeNode = {
  id: 'root',
  type: 'container',
  props: {},
  children: [],
}

interface Call {
  url: string
  method: string
  body: string
}

/** A community whose page at "/" is already Admin-only. */
const stub = (): Call[] => {
  const calls: Call[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const method = init?.method ?? 'GET'
      calls.push({ url: String(url), method, body: String(init?.body ?? '') })
      if (method === 'GET') {
        return new Response(
          JSON.stringify({
            data: {
              data: [
                {
                  id: 'page_acme_home',
                  path: '/',
                  component: 'component_tree',
                  pageTreeId: 'tree_live',
                  level: 3,
                  requiresAuth: true,
                },
              ],
            },
          }),
          { status: 200 }
        )
      }
      return new Response('{}', { status: 200 })
    })
  )
  return calls
}

const pageRow = (calls: Call[]) =>
  JSON.parse(
    calls.find(c => c.url.includes('/PageConfig/'))?.body ?? '{}'
  ) as Record<string, unknown>

afterEach(() => {
  vi.unstubAllGlobals()
})

/**
 * BQL hard-coded level 0 and requiresAuth false for every page it
 * published, so re-running a script over an existing Admin-only route
 * quietly made it public -- the same downgrade the route dropdown used to
 * cause, through a different door.
 *
 * The builder still says what it means, because its picker is how a
 * founder sets the level in the first place. A caller that says nothing
 * keeps what the row already had, and only a genuinely new page is public.
 */
describe('publishing without saying who may see it', () => {
  it('keeps the level the page already had', async () => {
    const calls = stub()
    const { result } = renderHook(() => usePublishPage(tree, vi.fn()))

    await act(async () => {
      await result.current.publish({ tenant: 'acme', path: '/', title: 'H' })
    })

    expect(pageRow(calls)).toMatchObject({ level: 3, requiresAuth: true })
  })

  it('still lets the builder set one explicitly', async () => {
    const calls = stub()
    const { result } = renderHook(() => usePublishPage(tree, vi.fn()))

    await act(async () => {
      await result.current.publish({
        tenant: 'acme',
        path: '/',
        title: 'H',
        level: 0,
        requiresAuth: false,
      })
    })

    expect(pageRow(calls)).toMatchObject({ level: 0, requiresAuth: false })
  })

  it('makes a page nobody has published yet public', async () => {
    const calls: Call[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        const method = init?.method ?? 'GET'
        calls.push({ url: String(url), method, body: String(init?.body ?? '') })
        if (method === 'GET') {
          return new Response(JSON.stringify({ data: { data: [] } }), {
            status: 200,
          })
        }
        return new Response('{}', { status: 200 })
      })
    )
    const { result } = renderHook(() => usePublishPage(tree, vi.fn()))

    await act(async () => {
      await result.current.publish({ tenant: 'acme', path: '/new', title: 'N' })
    })

    const created = JSON.parse(
      calls.find(c => c.method === 'POST' && c.url.endsWith('/PageConfig'))
        ?.body ?? '{}'
    ) as Record<string, unknown>
    expect(created).toMatchObject({ level: 0, requiresAuth: false })
  })
})
