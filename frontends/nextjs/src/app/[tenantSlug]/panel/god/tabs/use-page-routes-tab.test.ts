import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

const pageRoutes = vi.hoisted(() => ({ usePageRoutes: vi.fn() }))
vi.mock('@/hooks/usePageRoutes', () => pageRoutes)

const scopeMod = vi.hoisted(() => ({
  useCurrentTenantScope: vi.fn(() => ({
    tenant: 'system',
    canPickOtherTenant: true,
  })),
}))
vi.mock('./use-current-tenant-scope', () => scopeMod)

import { usePageRoutesTab } from './use-page-routes-tab'
import type { PageRoute } from '@/hooks/usePageRoutes'

const page: PageRoute = {
  id: 'p1',
  path: '/blog',
  title: 'Blog',
  level: 1,
  requiresAuth: false,
  pageTreeId: null,
  isPublished: true,
  sortOrder: 0,
}

function hookState() {
  return {
    pages: [page],
    loading: false,
    error: null,
    reload: vi.fn(),
    create: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn(),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  pageRoutes.usePageRoutes.mockReturnValue(hookState())
})

describe('usePageRoutesTab', () => {
  it('starts on the system tenant with the dialog closed', () => {
    const { result } = renderHook(() => usePageRoutesTab())
    expect(result.current.tenant).toBe('system')
    expect(result.current.formOpen).toBe(false)
    expect(result.current.editPage).toBeNull()
  })

  it('summarises published vs. draft counts from the loaded pages', () => {
    pageRoutes.usePageRoutes.mockReturnValue({
      ...hookState(),
      pages: [page, { ...page, id: 'p2', isPublished: false }],
    })
    const { result } = renderHook(() => usePageRoutesTab())
    expect(result.current.live).toBe(1)
    expect(result.current.draft).toBe(1)
  })

  it('openCreate clears editPage and opens the dialog', () => {
    const { result } = renderHook(() => usePageRoutesTab())
    act(() => result.current.openEdit(page))
    act(() => result.current.openCreate())
    expect(result.current.editPage).toBeNull()
    expect(result.current.formOpen).toBe(true)
  })

  it('openEdit sets editPage and opens the dialog', () => {
    const { result } = renderHook(() => usePageRoutesTab())
    act(() => result.current.openEdit(page))
    expect(result.current.editPage).toEqual(page)
    expect(result.current.formOpen).toBe(true)
  })

  it('handleFormClose closes the dialog and reloads', () => {
    const state = hookState()
    pageRoutes.usePageRoutes.mockReturnValue(state)
    const { result } = renderHook(() => usePageRoutesTab())
    act(() => result.current.openCreate())

    act(() => result.current.handleFormClose())

    expect(result.current.formOpen).toBe(false)
    expect(state.reload).toHaveBeenCalledOnce()
  })

  it('handleDeleteClose clears deletePage', () => {
    const { result } = renderHook(() => usePageRoutesTab())
    act(() => result.current.setDeletePage(page))
    act(() => result.current.handleDeleteClose())
    expect(result.current.deletePage).toBeNull()
  })

  it('handleCreate creates when no id is given', async () => {
    const state = hookState()
    pageRoutes.usePageRoutes.mockReturnValue(state)
    const { result } = renderHook(() => usePageRoutesTab())

    const data = { ...page, tenantId: 'system' } as never
    await act(async () => {
      await result.current.handleCreate(data)
    })

    expect(state.create).toHaveBeenCalledWith(data)
    expect(state.update).not.toHaveBeenCalled()
  })

  it('handleCreate updates when an id is given', async () => {
    const state = hookState()
    pageRoutes.usePageRoutes.mockReturnValue(state)
    const { result } = renderHook(() => usePageRoutesTab())

    const data = { ...page } as never
    await act(async () => {
      await result.current.handleCreate(data, 'p1')
    })

    expect(state.update).toHaveBeenCalledWith('p1', data)
    expect(state.create).not.toHaveBeenCalled()
  })
})
