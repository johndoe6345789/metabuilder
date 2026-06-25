import { renderHook, act } from '@testing-library/react'
import { useIdeLayout } from './useIdeLayout'

function down(
  result: { current: ReturnType<typeof useIdeLayout> },
  clientY: number,
) {
  act(() => {
    result.current.onIdeHandleMouseDown({
      clientY,
      preventDefault() {},
      currentTarget: { previousElementSibling: null },
    } as unknown as React.MouseEvent)
  })
}

function fire(type: 'mousemove' | 'mouseup', clientY: number) {
  act(() => {
    window.dispatchEvent(new MouseEvent(type, { clientY }))
  })
}

describe('useIdeLayout', () => {
  it('toggles maximized', () => {
    const { result } = renderHook(() => useIdeLayout())
    expect(result.current.maximized).toBe(false)
    act(() => result.current.toggleMaximized())
    expect(result.current.maximized).toBe(true)
    act(() => result.current.toggleMaximized())
    expect(result.current.maximized).toBe(false)
  })

  it('starts unsized (fills the viewport)', () => {
    const { result } = renderHook(() => useIdeLayout())
    expect(result.current.ideHeight).toBeNull()
  })

  it('grows when the bottom edge is dragged down', () => {
    const { result } = renderHook(() => useIdeLayout())
    down(result, 500)
    expect(result.current.ideDragging).toBe(true)
    fire('mousemove', 560) // down 60 → 400 + 60
    expect(result.current.ideHeight).toBe(460)
  })

  it('clamps to a minimum height', () => {
    const { result } = renderHook(() => useIdeLayout())
    down(result, 500)
    fire('mousemove', 80) // up 420 → clamp to 240
    expect(result.current.ideHeight).toBe(240)
  })

  it('resets back to unsized', () => {
    const { result } = renderHook(() => useIdeLayout())
    down(result, 500)
    fire('mousemove', 560)
    fire('mouseup', 560)
    act(() => result.current.resetIdeHeight())
    expect(result.current.ideHeight).toBeNull()
  })
})
