/**
 * Tests for useCanvasPan hook
 */

import { renderHook, act } from '@testing-library/react'
import { useCanvasPan } from '../useCanvasPan'

function makeInput(overrides: any = {}) {
  const canvasRef = { current: { getBoundingClientRect: jest.fn().mockReturnValue({ left: 0, top: 0 }) } }
  return {
    canvasOffset: { x: 0, y: 0 },
    setCanvasOffset: jest.fn(),
    zoom: 1,
    drawingConnection: null,
    setDrawingConnection: jest.fn(),
    canvasRef,
    ...overrides,
  }
}

function makeMouseEvent(overrides: any = {}) {
  return {
    clientX: 100,
    clientY: 100,
    target: null,
    currentTarget: null,
    ...overrides,
  }
}

describe('useCanvasPan', () => {
  it('should initialize with isPanning = false', () => {
    const input = makeInput()
    const { result } = renderHook(() => useCanvasPan(input))
    expect(result.current.isPanning).toBe(false)
  })

  it('should expose handleCanvasMouseDown, handleMouseMove, handleMouseUp', () => {
    const input = makeInput()
    const { result } = renderHook(() => useCanvasPan(input))
    expect(typeof result.current.handleCanvasMouseDown).toBe('function')
    expect(typeof result.current.handleMouseMove).toBe('function')
    expect(typeof result.current.handleMouseUp).toBe('function')
  })

  it('should start panning when mousedown on currentTarget', () => {
    const input = makeInput()
    const { result } = renderHook(() => useCanvasPan(input))

    const target = document.createElement('div')
    const e = { ...makeMouseEvent({ clientX: 50, clientY: 60 }), target, currentTarget: target }

    act(() => {
      result.current.handleCanvasMouseDown(e as any)
    })

    expect(result.current.isPanning).toBe(true)
  })

  it('should not start panning when mousedown on child element', () => {
    const input = makeInput()
    const { result } = renderHook(() => useCanvasPan(input))

    const parent = document.createElement('div')
    const child = document.createElement('button')
    const e = { ...makeMouseEvent(), target: child, currentTarget: parent }

    act(() => {
      result.current.handleCanvasMouseDown(e as any)
    })

    expect(result.current.isPanning).toBe(false)
  })

  it('should start panning when mousedown on SVG element', () => {
    const input = makeInput()
    const { result } = renderHook(() => useCanvasPan(input))

    const svgEl = { tagName: 'svg' }
    const parent = document.createElement('div')
    const e = { ...makeMouseEvent({ clientX: 10, clientY: 20 }), target: svgEl, currentTarget: parent }

    act(() => {
      result.current.handleCanvasMouseDown(e as any)
    })

    expect(result.current.isPanning).toBe(true)
  })

  it('handleMouseUp should stop panning', () => {
    const input = makeInput()
    const { result } = renderHook(() => useCanvasPan(input))

    const target = document.createElement('div')
    const e = { ...makeMouseEvent(), target, currentTarget: target }

    act(() => { result.current.handleCanvasMouseDown(e as any) })
    expect(result.current.isPanning).toBe(true)

    act(() => { result.current.handleMouseUp() })
    expect(result.current.isPanning).toBe(false)
  })

  it('handleMouseUp should clear drawing connection', () => {
    const drawingConnection = { sourceNodeId: 'n1', sourceOutput: 'main', currentPosition: { x: 0, y: 0 } }
    const input = makeInput({ drawingConnection })
    const { result } = renderHook(() => useCanvasPan(input))

    act(() => { result.current.handleMouseUp() })

    expect(input.setDrawingConnection).toHaveBeenCalledWith(null)
  })

  it('handleMouseMove should update canvas offset when panning', () => {
    const input = makeInput({ canvasOffset: { x: 10, y: 20 } })
    const { result } = renderHook(() => useCanvasPan(input))

    const target = document.createElement('div')
    const mousedown = { ...makeMouseEvent({ clientX: 50, clientY: 60 }), target, currentTarget: target }

    act(() => { result.current.handleCanvasMouseDown(mousedown as any) })

    const mousemove = makeMouseEvent({ clientX: 70, clientY: 80 })
    act(() => { result.current.handleMouseMove(mousemove as any) })

    expect(input.setCanvasOffset).toHaveBeenCalledWith({
      x: 70 - (50 - 10),
      y: 80 - (60 - 20),
    })
  })

  it('handleMouseMove should not update offset when not panning', () => {
    const input = makeInput()
    const { result } = renderHook(() => useCanvasPan(input))

    act(() => {
      result.current.handleMouseMove(makeMouseEvent() as any)
    })

    expect(input.setCanvasOffset).not.toHaveBeenCalled()
  })

  it('handleMouseMove should update drawing connection position', () => {
    const drawingConnection = { sourceNodeId: 'n1', sourceOutput: 'main', currentPosition: { x: 0, y: 0 } }
    const input = makeInput({ drawingConnection, canvasOffset: { x: 0, y: 0 }, zoom: 1 })
    const { result } = renderHook(() => useCanvasPan(input))

    const mousemove = makeMouseEvent({ clientX: 50, clientY: 60 })
    act(() => { result.current.handleMouseMove(mousemove as any) })

    expect(input.setDrawingConnection).toHaveBeenCalled()
    const updater = input.setDrawingConnection.mock.calls[0][0]
    const updated = updater(drawingConnection)
    expect(updated.currentPosition).toEqual({ x: 50, y: 60 })
  })
})
