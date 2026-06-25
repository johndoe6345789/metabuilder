import { renderHook, act } from '@testing-library/react'
import { useResizableDock } from './useResizableDock'

function mouseDown(
  result: { current: ReturnType<typeof useResizableDock> },
  clientY: number,
) {
  act(() => {
    result.current.onHandleMouseDown({
      clientY,
      preventDefault() {},
    } as unknown as React.MouseEvent)
  })
}

function fire(type: 'mousemove' | 'mouseup', clientY: number) {
  act(() => {
    window.dispatchEvent(new MouseEvent(type, { clientY }))
  })
}

describe('useResizableDock', () => {
  it('starts at the initial height', () => {
    const { result } = renderHook(() => useResizableDock({ initial: 250 }))
    expect(result.current.height).toBe(250)
    expect(result.current.dragging).toBe(false)
  })

  it('grows when the handle is dragged up', () => {
    const { result } = renderHook(() => useResizableDock({ initial: 200 }))
    mouseDown(result, 500)
    expect(result.current.dragging).toBe(true)
    fire('mousemove', 460) // up 40px
    expect(result.current.height).toBe(240)
  })

  it('shrinks when the handle is dragged down', () => {
    const { result } = renderHook(() =>
      useResizableDock({ initial: 300, min: 100 }),
    )
    mouseDown(result, 500)
    fire('mousemove', 540) // down 40px
    expect(result.current.height).toBe(260)
  })

  it('clamps to the minimum when dragged down past it', () => {
    const { result } = renderHook(() =>
      useResizableDock({ initial: 200, min: 170 }),
    )
    mouseDown(result, 500)
    fire('mousemove', 600) // down 100 → 100, clamps to 170
    expect(result.current.height).toBe(170)
  })

  it('ignores movement after mouseup', () => {
    const { result } = renderHook(() => useResizableDock({ initial: 200 }))
    mouseDown(result, 500)
    fire('mousemove', 480) // → 220
    fire('mouseup', 480)
    expect(result.current.dragging).toBe(false)
    fire('mousemove', 300) // no active drag — ignored
    expect(result.current.height).toBe(220)
  })
})
