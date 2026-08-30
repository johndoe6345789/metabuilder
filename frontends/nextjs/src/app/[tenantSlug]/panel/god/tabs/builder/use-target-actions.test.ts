import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { useTargetActions } from './use-target-actions'

const pages = [
  { path: '/blog', title: 'Blog' },
  { path: '/about', title: 'About' },
]

const setup = (target = { tenant: 'acme', path: '/blog', title: 'Blog' }) => {
  const setTarget = vi.fn()
  const t = { load: vi.fn(async () => ({ path: '/blog', title: 'Blog' })) }
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
