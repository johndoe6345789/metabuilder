import { describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

import { useAppDraft } from './use-app-draft'

const app = (id: string) => ({
  id,
  name: id,
  url: `https://${id}`,
  bgColor: '#000',
  fgColor: '#fff',
  embedMode: 'newtab' as const,
})

describe('useAppDraft', () => {
  it('refuses to add without a name or url', async () => {
    const onCreate = vi.fn(async () => {})
    const { result } = renderHook(() =>
      useAppDraft({ apps: [], onCreate, onUpdate: vi.fn(), onDelete: vi.fn() })
    )

    await act(async () => result.current.handleAdd())

    expect(onCreate).not.toHaveBeenCalled()
    expect(result.current.formError).toBe('Name and URL are required')
  })

  it('creates a slugged app and resets the draft', async () => {
    const onCreate = vi.fn(async () => {})
    const { result } = renderHook(() =>
      useAppDraft({
        apps: [app('a')],
        onCreate,
        onUpdate: vi.fn(),
        onDelete: vi.fn(),
      })
    )

    act(() => {
      result.current.setDraft({ ...result.current.draft, name: 'Plex', url: 'x' })
    })
    await act(async () => result.current.handleAdd())

    expect(onCreate).toHaveBeenCalledOnce()
    const created = onCreate.mock.calls[0][0]
    expect(created.name).toBe('Plex')
    expect(created.sortOrder).toBe(1)
    expect(result.current.draft.name).toBe('')
  })

  it('surfaces a thrown error from onCreate', async () => {
    const onCreate = vi.fn(async () => {
      throw new Error('offline')
    })
    const { result } = renderHook(() =>
      useAppDraft({ apps: [], onCreate, onUpdate: vi.fn(), onDelete: vi.fn() })
    )

    act(() => {
      result.current.setDraft({ ...result.current.draft, name: 'x', url: 'y' })
    })
    await act(async () => result.current.handleAdd())

    expect(result.current.formError).toBe('offline')
  })

  it('tracks busy by app id while updating embed mode', async () => {
    const onUpdate = vi.fn(async () => {})
    const { result } = renderHook(() =>
      useAppDraft({
        apps: [app('a')],
        onCreate: vi.fn(),
        onUpdate,
        onDelete: vi.fn(),
      })
    )

    await act(async () =>
      result.current.handleEmbedModeChange(app('a'), 'iframe')
    )

    expect(onUpdate).toHaveBeenCalledWith('a', { embedMode: 'iframe' })
    await waitFor(() => expect(result.current.busy).toBeNull())
  })

  it('deletes by id', async () => {
    const onDelete = vi.fn(async () => {})
    const { result } = renderHook(() =>
      useAppDraft({
        apps: [app('a')],
        onCreate: vi.fn(),
        onUpdate: vi.fn(),
        onDelete,
      })
    )

    await act(async () => result.current.handleDelete('a'))

    expect(onDelete).toHaveBeenCalledWith('a')
  })
})
