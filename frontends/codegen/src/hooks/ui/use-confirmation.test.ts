import { describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useConfirmation } from './use-confirmation'

describe('useConfirmation', () => {
  it('initialises with dialog closed', () => {
    const { result } = renderHook(() => useConfirmation())
    expect(result.current.state.open).toBe(false)
  })

  it('opens dialog with correct title and description', () => {
    const { result } = renderHook(() => useConfirmation())
    act(() => {
      result.current.confirm('Delete?', 'Are you sure?', vi.fn())
    })
    expect(result.current.state.open).toBe(true)
    expect(result.current.state.title).toBe('Delete?')
    expect(result.current.state.description).toBe('Are you sure?')
  })

  it('calls onConfirm callback and closes dialog', () => {
    const onConfirm = vi.fn()
    const { result } = renderHook(() => useConfirmation())
    act(() => {
      result.current.confirm('Title', 'Desc', onConfirm)
    })
    act(() => {
      result.current.handleConfirm()
    })
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(result.current.state.open).toBe(false)
  })

  it('calls onCancel callback and closes dialog', () => {
    const onCancel = vi.fn()
    const { result } = renderHook(() => useConfirmation())
    act(() => {
      result.current.confirm('Title', 'Desc', vi.fn(), onCancel)
    })
    act(() => {
      result.current.handleCancel()
    })
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(result.current.state.open).toBe(false)
  })

  it('handleCancel does not throw when no onCancel provided', () => {
    const { result } = renderHook(() => useConfirmation())
    act(() => {
      result.current.confirm('T', 'D', vi.fn())
    })
    expect(() => {
      act(() => { result.current.handleCancel() })
    }).not.toThrow()
    expect(result.current.state.open).toBe(false)
  })
})
