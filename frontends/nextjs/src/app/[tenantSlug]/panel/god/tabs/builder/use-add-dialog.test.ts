import { describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAddDialog } from './use-add-dialog'

describe('useAddDialog', () => {
  it('starts with nothing staged and the dialog closed', () => {
    const { result } = renderHook(() => useAddDialog(vi.fn()))
    expect(result.current.pendingType).toBeNull()
    expect(result.current.open).toBe(false)
  })

  it('opens on request', () => {
    const { result } = renderHook(() => useAddDialog(vi.fn()))
    act(() => {
      result.current.openDialog()
    })
    expect(result.current.open).toBe(true)
  })

  it('closes without adding anything on cancel', () => {
    const addNode = vi.fn()
    const { result } = renderHook(() => useAddDialog(addNode))
    act(() => {
      result.current.selectType('grid')
      result.current.openDialog()
    })
    act(() => {
      result.current.closeDialog()
    })
    expect(result.current.open).toBe(false)
    expect(addNode).not.toHaveBeenCalled()
    // Cancelling keeps the staged type -- only confirming clears it.
    expect(result.current.pendingType).toBe('grid')
  })

  it('adds the staged block at the confirmed target, then resets', () => {
    const addNode = vi.fn()
    const { result } = renderHook(() => useAddDialog(addNode))
    act(() => {
      result.current.selectType('grid')
      result.current.openDialog()
    })
    act(() => {
      result.current.confirm('hero')
    })
    expect(addNode).toHaveBeenCalledWith('grid', 'hero')
    expect(result.current.open).toBe(false)
    expect(result.current.pendingType).toBeNull()
  })

  it('does nothing on confirm when nothing was staged', () => {
    const addNode = vi.fn()
    const { result } = renderHook(() => useAddDialog(addNode))
    act(() => {
      result.current.confirm('hero')
    })
    expect(addNode).not.toHaveBeenCalled()
  })
})
