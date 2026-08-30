import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { useDropZone } from './use-drop-zone'

const dragEvent = (files: File[] = []) =>
  ({
    preventDefault: vi.fn(),
    dataTransfer: { files },
  }) as never

describe('useDropZone', () => {
  it('starts not dragging', () => {
    const { result } = renderHook(() => useDropZone(vi.fn()))
    expect(result.current.dragging).toBe(false)
  })

  it('marks dragging on drag-over, and prevents the default', () => {
    const { result } = renderHook(() => useDropZone(vi.fn()))
    const event = dragEvent()
    act(() => {
      result.current.onDragOver(event)
    })
    expect(event.preventDefault).toHaveBeenCalled()
    expect(result.current.dragging).toBe(true)
  })

  it('clears dragging on drag-leave', () => {
    const { result } = renderHook(() => useDropZone(vi.fn()))
    act(() => {
      result.current.onDragOver(dragEvent())
    })
    act(() => {
      result.current.onDragLeave()
    })
    expect(result.current.dragging).toBe(false)
  })

  it('passes the dropped file to the callback', () => {
    const onFile = vi.fn()
    const { result } = renderHook(() => useDropZone(onFile))
    const file = new File(['x'], 'logo.png')
    result.current.onDrop(dragEvent([file]))
    expect(onFile).toHaveBeenCalledWith(file)
  })

  it('passes undefined when nothing was dropped', () => {
    const onFile = vi.fn()
    const { result } = renderHook(() => useDropZone(onFile))
    result.current.onDrop(dragEvent([]))
    expect(onFile).toHaveBeenCalledWith(undefined)
  })

  it('clears dragging on drop', () => {
    const { result } = renderHook(() => useDropZone(vi.fn()))
    act(() => {
      result.current.onDragOver(dragEvent())
    })
    act(() => {
      result.current.onDrop(dragEvent())
    })
    expect(result.current.dragging).toBe(false)
  })

  it('prevents the default browser drop behaviour', () => {
    const { result } = renderHook(() => useDropZone(vi.fn()))
    const event = dragEvent()
    result.current.onDrop(event)
    expect(event.preventDefault).toHaveBeenCalled()
  })
})
