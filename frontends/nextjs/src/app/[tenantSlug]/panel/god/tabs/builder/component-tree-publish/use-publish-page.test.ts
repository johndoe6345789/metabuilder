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

afterEach(() => {
  vi.unstubAllGlobals()
})

/**
 * A publish the server refused used to be indistinguishable from one that
 * was never attempted: publish() returned false, the reason was dropped on
 * the floor, and the bar kept saying "Staged changes -- not yet published".
 * The reason the server gives is the whole diagnosis, so it has to reach
 * the screen.
 */
describe('usePublishPage', () => {
  it('reports the server reason when a write is rejected', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        if (String(url).endsWith('/PageTreeProp/_bulk/create')) {
          return new Response(
            JSON.stringify({
              error: 'Validation failed',
              fields: [{ field: 'sortOrder', message: 'Field is required' }],
            }),
            { status: 422 }
          )
        }
        if ((init?.method ?? 'GET') === 'GET') {
          return new Response(JSON.stringify({ data: { data: [] } }), {
            status: 200,
          })
        }
        return new Response('{}', { status: 200 })
      })
    )

    const { result } = renderHook(() => usePublishPage(tree, vi.fn()))

    let ok = true
    await act(async () => {
      ok = await result.current.publish(target)
    })

    expect(ok).toBe(false)
    expect(result.current.error).not.toBeNull()
    expect(result.current.error).toMatch(/sortOrder/)
  })

  it('leaves no error behind after a publish that works', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) =>
        (init?.method ?? 'GET') === 'GET'
          ? new Response(JSON.stringify({ data: { data: [] } }), {
              status: 200,
            })
          : new Response('{}', { status: 200 })
      )
    )

    const { result } = renderHook(() => usePublishPage(tree, vi.fn()))

    let ok = false
    await act(async () => {
      ok = await result.current.publish(target)
    })

    expect(ok).toBe(true)
    expect(result.current.error).toBeNull()
  })
})
