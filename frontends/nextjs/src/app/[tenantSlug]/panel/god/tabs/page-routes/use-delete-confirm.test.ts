import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useDeleteConfirm } from './use-delete-confirm'

describe('useDeleteConfirm', () => {
  it('starts idle with no error', () => {
    const { result } = renderHook(() => useDeleteConfirm(vi.fn()))
    expect(result.current.deleting).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('resolves true and clears deleting on success', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteConfirm(onConfirm))

    let succeeded = false
    await act(async () => {
      succeeded = await result.current.confirm()
    })

    expect(succeeded).toBe(true)
    expect(result.current.deleting).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('resolves false and reports the error message on failure', async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error('locked'))
    const { result } = renderHook(() => useDeleteConfirm(onConfirm))

    let succeeded = true
    await act(async () => {
      succeeded = await result.current.confirm()
    })

    expect(succeeded).toBe(false)
    expect(result.current.error).toBe('locked')
    expect(result.current.deleting).toBe(false)
  })

  it('reports a generic message for a non-Error rejection', async () => {
    class NotAnError {}
    const onConfirm = vi.fn().mockRejectedValue(new NotAnError())
    const { result } = renderHook(() => useDeleteConfirm(onConfirm))

    await act(async () => {
      await result.current.confirm()
    })

    expect(result.current.error).toBe('Delete failed')
  })

  it('is deleting while the confirm action is in flight', async () => {
    let resolve: () => void = () => undefined
    const onConfirm = vi.fn(
      () =>
        new Promise<void>(r => {
          resolve = r
        })
    )
    const { result } = renderHook(() => useDeleteConfirm(onConfirm))

    let pending: Promise<boolean> = Promise.resolve(false)
    act(() => {
      pending = result.current.confirm()
    })
    expect(result.current.deleting).toBe(true)

    await act(async () => {
      resolve()
      await pending
    })
    expect(result.current.deleting).toBe(false)
  })

  it('clears a previous error on a new attempt', async () => {
    const onConfirm = vi
      .fn()
      .mockRejectedValueOnce(new Error('first failure'))
      .mockResolvedValueOnce(undefined)
    const { result } = renderHook(() => useDeleteConfirm(onConfirm))

    await act(async () => {
      await result.current.confirm()
    })
    expect(result.current.error).toBe('first failure')

    await act(async () => {
      await result.current.confirm()
    })
    expect(result.current.error).toBeNull()
  })
})
