import { describe, expect, it } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePendingAdd } from './use-pending-add'

describe('usePendingAdd', () => {
  it('starts with nothing staged', () => {
    const { result } = renderHook(() => usePendingAdd())
    expect(result.current.pendingType).toBeNull()
  })

  it('stages a block type on select', () => {
    const { result } = renderHook(() => usePendingAdd())
    act(() => {
      result.current.select('html.h1')
    })
    expect(result.current.pendingType).toBe('html.h1')
  })

  it('lets a later selection replace an earlier one', () => {
    const { result } = renderHook(() => usePendingAdd())
    act(() => {
      result.current.select('html.h1')
    })
    act(() => {
      result.current.select('button')
    })
    expect(result.current.pendingType).toBe('button')
  })

  it('clears back to nothing staged', () => {
    const { result } = renderHook(() => usePendingAdd())
    act(() => {
      result.current.select('button')
    })
    act(() => {
      result.current.clear()
    })
    expect(result.current.pendingType).toBeNull()
  })
})
