import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { NODE_MIME, PALETTE_MIME, useOutlineDrag } from './use-outline-drag'

function dragEvent(overrides: {
  getData?: (fmt: string) => string
  clientY?: number
  top?: number
  height?: number
} = {}) {
  const data: Record<string, string> = {}
  return {
    preventDefault: vi.fn(),
    clientY: overrides.clientY ?? 50,
    currentTarget: {
      getBoundingClientRect: () =>
        ({
          top: overrides.top ?? 0,
          height: overrides.height ?? 100,
        }) as DOMRect,
    },
    dataTransfer: {
      effectAllowed: '',
      setData: (fmt: string, value: string) => {
        data[fmt] = value
      },
      getData:
        overrides.getData ?? ((fmt: string) => data[fmt] ?? ''),
    },
  } as unknown as React.DragEvent
}

describe('useOutlineDrag', () => {
  it('starts with nothing dropping', () => {
    const { result } = renderHook(() =>
      useOutlineDrag({ nodeId: 'n1', onAdd: vi.fn(), onMove: vi.fn() })
    )
    expect(result.current.dropping).toBeNull()
  })

  it('onDragStart writes the node id and allows copy/move', () => {
    const { result } = renderHook(() =>
      useOutlineDrag({ nodeId: 'n1', onAdd: vi.fn(), onMove: vi.fn() })
    )
    const event = dragEvent()
    act(() => result.current.onDragStart(event))
    expect(event.dataTransfer.getData(NODE_MIME)).toBe('n1')
    expect(event.dataTransfer.effectAllowed).toBe('copyMove')
  })

  it('onDragOver on the root always reports "into"', () => {
    const { result } = renderHook(() =>
      useOutlineDrag({ nodeId: 'root', onAdd: vi.fn(), onMove: vi.fn() })
    )
    act(() => result.current.onDragOver(dragEvent({ clientY: 5 })))
    expect(result.current.dropping).toBe('into')
  })

  it('onDragOver on a normal row reports the edge-aware position', () => {
    const { result } = renderHook(() =>
      useOutlineDrag({ nodeId: 'n1', onAdd: vi.fn(), onMove: vi.fn() })
    )
    act(() => result.current.onDragOver(dragEvent({ clientY: 5 })))
    expect(result.current.dropping).toBe('before')
  })

  it('onDragLeave clears the dropping edge', () => {
    const { result } = renderHook(() =>
      useOutlineDrag({ nodeId: 'n1', onAdd: vi.fn(), onMove: vi.fn() })
    )
    act(() => result.current.onDragOver(dragEvent({ clientY: 5 })))
    act(() => result.current.onDragLeave())
    expect(result.current.dropping).toBeNull()
  })

  it('onDrop with a palette payload calls onAdd, not onMove', () => {
    const onAdd = vi.fn()
    const onMove = vi.fn()
    const { result } = renderHook(() =>
      useOutlineDrag({ nodeId: 'n1', onAdd, onMove })
    )
    const event = dragEvent({
      getData: (fmt: string) => (fmt === PALETTE_MIME ? 'button' : ''),
    })
    act(() => result.current.onDrop(event))
    expect(onAdd).toHaveBeenCalledWith('button', 'n1')
    expect(onMove).not.toHaveBeenCalled()
    expect(result.current.dropping).toBeNull()
  })

  it('onDrop with a node payload calls onMove using the hovered edge', () => {
    const onAdd = vi.fn()
    const onMove = vi.fn()
    const { result } = renderHook(() =>
      useOutlineDrag({ nodeId: 'n1', onAdd, onMove })
    )
    act(() => result.current.onDragOver(dragEvent({ clientY: 95 })))
    const event = dragEvent({
      getData: (fmt: string) => (fmt === NODE_MIME ? 'dragged' : ''),
    })
    act(() => result.current.onDrop(event))
    expect(onMove).toHaveBeenCalledWith('dragged', 'n1', 'after')
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('onDrop defaults to "into" when nothing was hovered first', () => {
    const onMove = vi.fn()
    const { result } = renderHook(() =>
      useOutlineDrag({ nodeId: 'n1', onAdd: vi.fn(), onMove })
    )
    const event = dragEvent({
      getData: (fmt: string) => (fmt === NODE_MIME ? 'dragged' : ''),
    })
    act(() => result.current.onDrop(event))
    expect(onMove).toHaveBeenCalledWith('dragged', 'n1', 'into')
  })

  it('onDrop with neither payload calls neither callback', () => {
    const onAdd = vi.fn()
    const onMove = vi.fn()
    const { result } = renderHook(() =>
      useOutlineDrag({ nodeId: 'n1', onAdd, onMove })
    )
    act(() => result.current.onDrop(dragEvent()))
    expect(onAdd).not.toHaveBeenCalled()
    expect(onMove).not.toHaveBeenCalled()
  })
})
