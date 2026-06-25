/**
 * Tests for useCanvasTransform
 */

jest.mock('../../../../hooks/canvas', () => ({
  useProjectCanvas: jest.fn(),
}))

jest.mock('../useWheelZoom', () => ({
  useWheelZoom: jest.fn(),
}))

jest.mock('../useDocumentMouseEvents', () => ({
  useDocumentMouseEvents: jest.fn(),
}))

import { renderHook, act } from '@testing-library/react'
import { useProjectCanvas } from '../../../../hooks/canvas'
import { useWheelZoom } from '../useWheelZoom'
import { useDocumentMouseEvents } from '../useDocumentMouseEvents'
import { useCanvasTransform } from '../useCanvasTransform'

const mockPanCanvas = jest.fn()
const mockBindWheelListener = jest.fn(() => jest.fn())

function setupMocks() {
  ;(useProjectCanvas as jest.Mock).mockReturnValue({
    zoom: 1,
    pan: { x: 0, y: 0 },
    pan_canvas: mockPanCanvas,
  })
  ;(useWheelZoom as jest.Mock).mockReturnValue({
    bindWheelListener: mockBindWheelListener,
  })
  ;(useDocumentMouseEvents as jest.Mock).mockImplementation(() => {})
}

function makeMouseEvent(overrides: any = {}) {
  return {
    button: 0,
    shiftKey: false,
    clientX: 100,
    clientY: 100,
    preventDefault: jest.fn(),
    ...overrides,
  }
}

describe('useCanvasTransform', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupMocks()
  })

  it('should initialize with isPanning = false', () => {
    const { result } = renderHook(() => useCanvasTransform())
    expect(result.current.isPanning).toBe(false)
  })

  it('should return bindWheelListener from useWheelZoom', () => {
    const { result } = renderHook(() => useCanvasTransform())
    expect(result.current.bindWheelListener).toBe(mockBindWheelListener)
  })

  it('handleMouseDown should start panning when shift+left-button', () => {
    const { result } = renderHook(() => useCanvasTransform())

    act(() => {
      result.current.handleMouseDown(makeMouseEvent({ shiftKey: true }) as any)
    })

    expect(result.current.isPanning).toBe(true)
  })

  it('handleMouseDown should call preventDefault when shift+left-button', () => {
    const { result } = renderHook(() => useCanvasTransform())
    const e = makeMouseEvent({ shiftKey: true })

    act(() => {
      result.current.handleMouseDown(e as any)
    })

    expect(e.preventDefault).toHaveBeenCalled()
  })

  it('handleMouseDown should not start panning without shift key', () => {
    const { result } = renderHook(() => useCanvasTransform())

    act(() => {
      result.current.handleMouseDown(makeMouseEvent({ shiftKey: false }) as any)
    })

    expect(result.current.isPanning).toBe(false)
  })

  it('handleMouseDown should not start panning with right button', () => {
    const { result } = renderHook(() => useCanvasTransform())

    act(() => {
      result.current.handleMouseDown(makeMouseEvent({ button: 2, shiftKey: true }) as any)
    })

    expect(result.current.isPanning).toBe(false)
  })

  it('handleMouseMove should call pan_canvas when panning', () => {
    const { result } = renderHook(() => useCanvasTransform())

    // Start panning
    act(() => {
      result.current.handleMouseDown(makeMouseEvent({ shiftKey: true, clientX: 100, clientY: 100 }) as any)
    })

    // Move mouse
    act(() => {
      result.current.handleMouseMove(makeMouseEvent({ clientX: 150, clientY: 110 }) as any)
    })

    expect(mockPanCanvas).toHaveBeenCalledWith({ x: 50, y: 10 })
  })

  it('handleMouseMove should not call pan_canvas when not panning', () => {
    const { result } = renderHook(() => useCanvasTransform())

    act(() => {
      result.current.handleMouseMove(makeMouseEvent({ clientX: 150, clientY: 110 }) as any)
    })

    expect(mockPanCanvas).not.toHaveBeenCalled()
  })

  it('handleMouseUp should stop panning', () => {
    const { result } = renderHook(() => useCanvasTransform())

    act(() => {
      result.current.handleMouseDown(makeMouseEvent({ shiftKey: true }) as any)
    })
    expect(result.current.isPanning).toBe(true)

    act(() => {
      result.current.handleMouseUp()
    })
    expect(result.current.isPanning).toBe(false)
  })

  it('handleArrowPan should call pan_canvas with arrow delta', () => {
    const { result } = renderHook(() => useCanvasTransform())

    act(() => { result.current.handleArrowPan('up') })
    expect(mockPanCanvas).toHaveBeenCalledWith({ x: 0, y: 100 })

    jest.clearAllMocks()
    act(() => { result.current.handleArrowPan('down') })
    expect(mockPanCanvas).toHaveBeenCalledWith({ x: 0, y: -100 })

    jest.clearAllMocks()
    act(() => { result.current.handleArrowPan('left') })
    expect(mockPanCanvas).toHaveBeenCalledWith({ x: 100, y: 0 })

    jest.clearAllMocks()
    act(() => { result.current.handleArrowPan('right') })
    expect(mockPanCanvas).toHaveBeenCalledWith({ x: -100, y: 0 })
  })

  it('should call onCanvasPan callback during mouse move', () => {
    const onCanvasPan = jest.fn()
    const { result } = renderHook(() => useCanvasTransform(onCanvasPan))

    act(() => {
      result.current.handleMouseDown(makeMouseEvent({ shiftKey: true, clientX: 100, clientY: 100 }) as any)
    })

    act(() => {
      result.current.handleMouseMove(makeMouseEvent({ clientX: 150, clientY: 110 }) as any)
    })

    expect(onCanvasPan).toHaveBeenCalledWith({ x: 50, y: 10 })
  })
})
