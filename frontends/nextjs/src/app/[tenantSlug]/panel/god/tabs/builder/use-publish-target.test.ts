import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { usePublishTarget } from './use-publish-target'
import { DEFAULT_PUBLISH_TARGET } from './component-tree-publish'

describe('usePublishTarget', () => {
  it('starts with the default target, scoped to the given tenant', () => {
    const { result } = renderHook(() => usePublishTarget('acme'))
    expect(result.current[0]).toEqual({
      ...DEFAULT_PUBLISH_TARGET,
      tenant: 'acme',
    })
  })

  it('updates the tenant when a different one is signed in', () => {
    const { result, rerender } = renderHook(
      ({ tenant }) => usePublishTarget(tenant),
      { initialProps: { tenant: 'acme' } }
    )
    rerender({ tenant: 'other' })
    expect(result.current[0].tenant).toBe('other')
  })

  it('keeps the rest of the target when the tenant changes', () => {
    const { result, rerender } = renderHook(
      ({ tenant }) => usePublishTarget(tenant),
      { initialProps: { tenant: 'acme' } }
    )
    act(() => {
      result.current[1](prev => ({ ...prev, path: '/blog' }))
    })
    rerender({ tenant: 'other' })
    expect(result.current[0]).toMatchObject({
      tenant: 'other',
      path: '/blog',
    })
  })

  it('lets the caller set the target directly', () => {
    const { result } = renderHook(() => usePublishTarget('acme'))
    act(() => {
      result.current[1](prev => ({ ...prev, title: 'New title' }))
    })
    expect(result.current[0].title).toBe('New title')
  })
})
