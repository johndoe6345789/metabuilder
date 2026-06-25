/**
 * Tests for useCardDrag
 */

jest.mock('../../../../hooks/canvas', () => ({
  useProjectCanvas: jest.fn(),
}))

import { renderHook, act } from '@testing-library/react'
import { useProjectCanvas } from '../../../../hooks/canvas'
import { useCardDrag } from '../useCardDrag'

const mockSetDragging = jest.fn()

function setupMocks() {
  ;(useProjectCanvas as jest.Mock).mockReturnValue({
    set_dragging: mockSetDragging,
  })
}

function makeParams(overrides: any = {}) {
  return {
    itemId: 'item-1',
    itemPosition: { x: 100, y: 200 },
    zoom: 1,
    snapToGrid: (pos: any) => pos, // identity
    onUpdatePosition: jest.fn(),
    ...overrides,
  }
}

function makeMouseEvent(overrides: any = {}) {
  return {
    button: 0,
    clientX: 100,
    clientY: 100,
    stopPropagation: jest.fn(),
    target: document.createElement('div'),
    ...overrides,
  }
}

describe('useCardDrag', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupMocks()
  })

  it('should return cardRef and handleDragStart', () => {
    const { result } = renderHook(() => useCardDrag(makeParams()))
    expect(result.current.cardRef).toBeDefined()
    expect(typeof result.current.handleDragStart).toBe('function')
  })

  it('handleDragStart should call set_dragging(true)', () => {
    const params = makeParams()
    const { result } = renderHook(() => useCardDrag(params))

    act(() => {
      result.current.handleDragStart(makeMouseEvent() as any)
    })

    expect(mockSetDragging).toHaveBeenCalledWith(true)
  })

  it('handleDragStart should call stopPropagation', () => {
    const params = makeParams()
    const { result } = renderHook(() => useCardDrag(params))
    const e = makeMouseEvent()

    act(() => {
      result.current.handleDragStart(e as any)
    })

    expect(e.stopPropagation).toHaveBeenCalled()
  })

  it('handleDragStart should not start drag with right button', () => {
    const params = makeParams()
    const { result } = renderHook(() => useCardDrag(params))
    const e = makeMouseEvent({ button: 2 })

    act(() => {
      result.current.handleDragStart(e as any)
    })

    expect(mockSetDragging).not.toHaveBeenCalled()
  })

  it('handleDragStart should not start drag on [data-no-drag] element', () => {
    const params = makeParams()
    const { result } = renderHook(() => useCardDrag(params))

    const noDragEl = document.createElement('button')
    noDragEl.setAttribute('data-no-drag', 'true')
    const parent = document.createElement('div')
    parent.appendChild(noDragEl)

    const e = makeMouseEvent({ target: noDragEl })

    act(() => {
      result.current.handleDragStart(e as any)
    })

    expect(mockSetDragging).not.toHaveBeenCalled()
  })

  it('should set_dragging(false) when drag ends (mouseup)', () => {
    const params = makeParams()
    const { result } = renderHook(() => useCardDrag(params))

    act(() => {
      result.current.handleDragStart(makeMouseEvent() as any)
    })
    expect(mockSetDragging).toHaveBeenCalledWith(true)

    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
    })

    expect(mockSetDragging).toHaveBeenCalledWith(false)
  })

  it('should add document event listeners when dragging starts', () => {
    const params = makeParams()
    const { result } = renderHook(() => useCardDrag(params))
    const addSpy = jest.spyOn(document, 'addEventListener')

    act(() => {
      result.current.handleDragStart(makeMouseEvent() as any)
    })

    expect(addSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
    expect(addSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
    addSpy.mockRestore()
  })
})
