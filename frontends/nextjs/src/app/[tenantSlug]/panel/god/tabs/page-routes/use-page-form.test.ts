import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { usePageForm } from './use-page-form'
import type { PageRoute } from '@/hooks/usePageRoutes'

const existing: PageRoute = {
  id: 'p1',
  path: '/blog',
  title: 'Blog',
  level: 1,
  requiresAuth: false,
  pageTreeId: null,
  isPublished: true,
  sortOrder: 0,
}

describe('usePageForm', () => {
  it('seeds the draft from an existing page', () => {
    const { result } = renderHook(() =>
      usePageForm({
        page: existing,
        tenant: 'acme',
        onSubmit: vi.fn(),
        onClose: vi.fn(),
      })
    )
    expect(result.current.form.path).toBe('/blog')
    expect(result.current.form.title).toBe('Blog')
  })

  it('seeds a fresh default draft with no page', () => {
    const { result } = renderHook(() =>
      usePageForm({
        page: null,
        tenant: 'acme',
        onSubmit: vi.fn(),
        onClose: vi.fn(),
      })
    )
    expect(result.current.form.path).toBe('/')
    expect(result.current.form.title).toBe('')
    expect(result.current.form.tenantId).toBe('acme')
  })

  it('handleChange updates a single field', () => {
    const { result } = renderHook(() =>
      usePageForm({
        page: null,
        tenant: 'acme',
        onSubmit: vi.fn(),
        onClose: vi.fn(),
      })
    )
    act(() => result.current.handleChange('title', 'New Title'))
    expect(result.current.form.title).toBe('New Title')
  })

  it('pathValid/titleValid reflect whether each has content', () => {
    const { result } = renderHook(() =>
      usePageForm({
        page: null,
        tenant: 'acme',
        onSubmit: vi.fn(),
        onClose: vi.fn(),
      })
    )
    expect(result.current.pathValid).toBe(true)
    expect(result.current.titleValid).toBe(false)

    act(() => result.current.handleChange('title', 'Home'))
    expect(result.current.titleValid).toBe(true)
  })

  it('handleSubmit sends the merged form and closes on success', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    const { result } = renderHook(() =>
      usePageForm({ page: existing, tenant: 'acme', onSubmit, onClose })
    )

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ path: '/blog', tenantId: 'acme' }),
      'p1'
    )
    expect(onClose).toHaveBeenCalledOnce()
    expect(result.current.saving).toBe(false)
  })

  it('handleSubmit reports the error and does not close on failure', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('422'))
    const onClose = vi.fn()
    const { result } = renderHook(() =>
      usePageForm({ page: null, tenant: 'acme', onSubmit, onClose })
    )

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(result.current.error).toBe('422')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('is saving while handleSubmit is in flight', async () => {
    let resolve: () => void = () => undefined
    const onSubmit = vi.fn(
      () =>
        new Promise<void>(r => {
          resolve = r
        })
    )
    const { result } = renderHook(() =>
      usePageForm({ page: null, tenant: 'acme', onSubmit, onClose: vi.fn() })
    )

    let pending: Promise<void> = Promise.resolve()
    act(() => {
      pending = result.current.handleSubmit()
    })
    expect(result.current.saving).toBe(true)

    await act(async () => {
      resolve()
      await pending
    })
    expect(result.current.saving).toBe(false)
  })
})
