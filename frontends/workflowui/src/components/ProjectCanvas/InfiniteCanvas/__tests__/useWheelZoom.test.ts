/**
 * Tests for useWheelZoom
 */

import { renderHook } from '@testing-library/react'
import { useWheelZoom } from '../useWheelZoom'

describe('useWheelZoom', () => {
  it('should return bindWheelListener function', () => {
    const { result } = renderHook(() => useWheelZoom({ zoom: 1 }))
    expect(typeof result.current.bindWheelListener).toBe('function')
  })

  it('bindWheelListener should return a cleanup function when element is null', () => {
    const { result } = renderHook(() => useWheelZoom({ zoom: 1 }))
    const cleanup = result.current.bindWheelListener(null)
    expect(typeof cleanup).toBe('function')
  })

  it('bindWheelListener should add and return cleanup for wheel events on element', () => {
    const onCanvasZoom = jest.fn()
    const { result } = renderHook(() => useWheelZoom({ zoom: 1, onCanvasZoom }))

    const mockElement = document.createElement('div')
    const addSpy = jest.spyOn(mockElement, 'addEventListener')
    const removeSpy = jest.spyOn(mockElement, 'removeEventListener')

    const cleanup = result.current.bindWheelListener(mockElement)

    expect(addSpy).toHaveBeenCalledWith('wheel', expect.any(Function), { passive: false })

    // Call cleanup
    cleanup()
    expect(removeSpy).toHaveBeenCalledWith('wheel', expect.any(Function))
  })

  it('should call onCanvasZoom with new zoom on ctrl+wheel down', () => {
    const onCanvasZoom = jest.fn()
    const { result } = renderHook(() => useWheelZoom({ zoom: 1, onCanvasZoom }))

    const mockElement = document.createElement('div')
    result.current.bindWheelListener(mockElement)

    const wheelEvent = new WheelEvent('wheel', {
      deltaY: 100, // scroll down = zoom out
      ctrlKey: true,
      bubbles: true,
    })
    // Prevent default check
    const preventDefaultSpy = jest.spyOn(wheelEvent, 'preventDefault')
    mockElement.dispatchEvent(wheelEvent)

    expect(preventDefaultSpy).toHaveBeenCalled()
    expect(onCanvasZoom).toHaveBeenCalledWith(0.9) // 1 * 0.9
  })

  it('should call onCanvasZoom with new zoom on ctrl+wheel up', () => {
    const onCanvasZoom = jest.fn()
    const { result } = renderHook(() => useWheelZoom({ zoom: 1, onCanvasZoom }))

    const mockElement = document.createElement('div')
    result.current.bindWheelListener(mockElement)

    const wheelEvent = new WheelEvent('wheel', {
      deltaY: -100, // scroll up = zoom in
      ctrlKey: true,
      bubbles: true,
    })
    mockElement.dispatchEvent(wheelEvent)

    expect(onCanvasZoom).toHaveBeenCalledWith(1.1) // 1 * 1.1
  })

  it('should not call onCanvasZoom without ctrl/meta key', () => {
    const onCanvasZoom = jest.fn()
    const { result } = renderHook(() => useWheelZoom({ zoom: 1, onCanvasZoom }))

    const mockElement = document.createElement('div')
    result.current.bindWheelListener(mockElement)

    const wheelEvent = new WheelEvent('wheel', { deltaY: 100 })
    mockElement.dispatchEvent(wheelEvent)

    expect(onCanvasZoom).not.toHaveBeenCalled()
  })

  it('should clamp zoom to minimum 0.1', () => {
    const onCanvasZoom = jest.fn()
    const { result } = renderHook(() => useWheelZoom({ zoom: 0.1, onCanvasZoom }))

    const mockElement = document.createElement('div')
    result.current.bindWheelListener(mockElement)

    // zoom out from 0.1 = 0.1 * 0.9 = 0.09 -> clamped to 0.1
    const wheelEvent = new WheelEvent('wheel', { deltaY: 100, ctrlKey: true })
    mockElement.dispatchEvent(wheelEvent)

    expect(onCanvasZoom).toHaveBeenCalledWith(0.1)
  })

  it('should clamp zoom to maximum 3', () => {
    const onCanvasZoom = jest.fn()
    const { result } = renderHook(() => useWheelZoom({ zoom: 3, onCanvasZoom }))

    const mockElement = document.createElement('div')
    result.current.bindWheelListener(mockElement)

    // zoom in from 3 = 3 * 1.1 = 3.3 -> clamped to 3
    const wheelEvent = new WheelEvent('wheel', { deltaY: -100, ctrlKey: true })
    mockElement.dispatchEvent(wheelEvent)

    expect(onCanvasZoom).toHaveBeenCalledWith(3)
  })

  it('should work with metaKey instead of ctrlKey', () => {
    const onCanvasZoom = jest.fn()
    const { result } = renderHook(() => useWheelZoom({ zoom: 1, onCanvasZoom }))

    const mockElement = document.createElement('div')
    result.current.bindWheelListener(mockElement)

    const wheelEvent = new WheelEvent('wheel', { deltaY: -100, metaKey: true })
    mockElement.dispatchEvent(wheelEvent)

    expect(onCanvasZoom).toHaveBeenCalledWith(1.1)
  })

  it('should not throw when onCanvasZoom is not provided', () => {
    const { result } = renderHook(() => useWheelZoom({ zoom: 1 }))

    const mockElement = document.createElement('div')
    result.current.bindWheelListener(mockElement)

    const wheelEvent = new WheelEvent('wheel', { deltaY: 100, ctrlKey: true })
    expect(() => mockElement.dispatchEvent(wheelEvent)).not.toThrow()
  })
})
