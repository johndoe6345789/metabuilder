import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { useTargetActions } from './use-target-actions'

const pages = [
  { path: '/blog', title: 'Blog' },
  { path: '/about', title: 'About' },
]

const setup = (target = { tenant: 'acme', path: '/blog', title: 'Blog' }) => {
  const setTarget = vi.fn()
  const t = {
    load: vi.fn(async () => ({ path: '/blog', title: 'Blog' })),
    loadedPath: null,
  }
  const { result } = renderHook(() =>
    useTargetActions(t, 'acme', target, pages, setTarget)
  )
  return { result, setTarget, t }
}

describe('pick', () => {
  it('loads the tree for the picked path', () => {
    const { result, t } = setup()
    act(() => {
      result.current.pick('/about')
    })
    expect(t.load).toHaveBeenCalledWith('acme', '/about')
  })

  it('carries the picked page\'s title into the target', () => {
    const { result, setTarget } = setup()
    act(() => {
      result.current.pick('/about')
    })
    const updater = setTarget.mock.calls[0]?.[0] as (p: unknown) => unknown
    expect(updater({ title: 'old' })).toMatchObject({
      path: '/about',
      title: 'About',
    })
  })

  it('keeps the previous title when the path names no known page', () => {
    const { result, setTarget } = setup()
    act(() => {
      result.current.pick('/ghost')
    })
    const updater = setTarget.mock.calls[0]?.[0] as (p: unknown) => unknown
    expect(updater({ title: 'kept' })).toMatchObject({ title: 'kept' })
  })
})

describe('change', () => {
  it('merges the patch over the previous target', () => {
    const { result, setTarget } = setup()
    act(() => {
      result.current.change({ level: 2 })
    })
    const updater = setTarget.mock.calls[0]?.[0] as (p: unknown) => unknown
    expect(updater({ path: '/x', level: 0 })).toEqual({
      path: '/x',
      level: 2,
    })
  })
})

describe('load', () => {
  it('loads the current target\'s tenant and path', async () => {
    const { result, t } = setup()
    await act(async () => {
      result.current.load()
      await Promise.resolve()
    })
    expect(t.load).toHaveBeenCalledWith('acme', '/blog')
  })

  it('applies what the load resolved with', async () => {
    const { result, setTarget } = setup()
    await act(async () => {
      result.current.load()
      await Promise.resolve()
    })
    const updater = setTarget.mock.calls[0]?.[0] as (p: unknown) => unknown
    expect(updater({ path: 'old', title: 'old' })).toMatchObject({
      path: '/blog',
      title: 'Blog',
    })
  })

  it('does nothing when the load resolves to nothing', async () => {
    const setTarget = vi.fn()
    const t = { load: vi.fn(async () => null) }
    const { result } = renderHook(() =>
      useTargetActions(
        t,
        'acme',
        { tenant: 'acme', path: '/blog', title: 'Blog' },
        pages,
        setTarget
      )
    )
    await act(async () => {
      result.current.load()
      await Promise.resolve()
    })
    expect(setTarget).not.toHaveBeenCalled()
  })
})


/**
 * `load` right beside `pick` applies what use-load-page returns -- title,
 * level and requiresAuth -- and its docstring says it reads them back
 * precisely "so a re-publish doesn't silently reset them". `pick` threw
 * the same value away.
 *
 * So: open the builder, choose an Admin-only page from the route dropdown,
 * press Publish. write-page-row writes the level sitting in the target,
 * which is DEFAULT_PUBLISH_TARGET's 0, and the page is public. Nothing on
 * screen says the level changed, and the page still looks right.
 */
describe('picking a route that is not public', () => {
  const gated = () => {
    const setTarget = vi.fn()
    const t = {
      load: vi.fn(async () => ({
        title: 'Board minutes',
        level: 3,
        requiresAuth: true,
      })),
    }
    const { result } = renderHook(() =>
      useTargetActions(
        t,
        'acme',
        { tenant: 'acme', path: '/blog', title: 'Blog' },
        pages,
        setTarget
      )
    )
    return { result, setTarget, t }
  }

  const applied = (setTarget: ReturnType<typeof vi.fn>) =>
    setTarget.mock.calls
      .map(call => call[0] as unknown)
      .filter((u): u is (p: unknown) => unknown => typeof u === 'function')
      .reduce<Record<string, unknown>>(
        (acc, update) => ({
          ...acc,
          ...(update(acc) as Record<string, unknown>),
        }),
        { level: 0, requiresAuth: false }
      )

  it('keeps the level the page was published with', async () => {
    const { result, setTarget } = gated()
    await act(async () => {
      result.current.pick('/about')
    })
    expect(applied(setTarget)).toMatchObject({
      level: 3,
      requiresAuth: true,
    })
  })

  it('still moves to the picked path', async () => {
    const { result, setTarget } = gated()
    await act(async () => {
      result.current.pick('/about')
    })
    expect(applied(setTarget)).toMatchObject({ path: '/about' })
  })
})

/**
 * The publish bar gated on dirty.tree alone, and load() clears that flag.
 * So: load /about, change the target path to /pricing, press Publish --
 * greyed out, with nothing on screen saying why. The founder had to make
 * a throwaway edit first. Pointing a loaded tree at a different path is a
 * change worth publishing, so the hook now says where the tree came from.
 */
describe('where the tree on screen came from', () => {
  // The record lives with the tree, which also loads on mount; this only
  // passes it through to the setup panel.
  it('is whatever the tree says it loaded', () => {
    const setTarget = vi.fn()
    const t = { load: vi.fn(async () => null), loadedPath: '/about' }
    const { result } = renderHook(() =>
      useTargetActions(
        t,
        'acme',
        { tenant: 'acme', path: '/blog', title: 'B' },
        pages,
        setTarget
      )
    )
    expect(result.current.loadedPath).toBe('/about')
  })
})
