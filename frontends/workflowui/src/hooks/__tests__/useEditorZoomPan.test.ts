/**
 * Tests for useEditorZoom and useEditorPan hooks
 */

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}))

jest.mock('@metabuilder/redux-slices', () => ({
  editorSlice: {
    actions: {
      setZoom: jest.fn((v) => ({ type: 'editor/setZoom', payload: v })),
      zoomIn: jest.fn(() => ({ type: 'editor/zoomIn' })),
      zoomOut: jest.fn(() => ({ type: 'editor/zoomOut' })),
      resetZoom: jest.fn(() => ({ type: 'editor/resetZoom' })),
      setPan: jest.fn((v) => ({ type: 'editor/setPan', payload: v })),
      panBy: jest.fn((v) => ({ type: 'editor/panBy', payload: v })),
      resetPan: jest.fn(() => ({ type: 'editor/resetPan' })),
    },
  },
}))

import { renderHook, act } from '@testing-library/react'
import { useDispatch, useSelector } from 'react-redux'
import { editorSlice } from '@metabuilder/redux-slices'
import { useEditorZoom } from '../useEditorZoom'
import { useEditorPan } from '../useEditorPan'

const mockDispatch = jest.fn()
const { setZoom, zoomIn, zoomOut, resetZoom, setPan, panBy, resetPan } = editorSlice.actions

describe('useEditorZoom', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useDispatch as jest.Mock).mockReturnValue(mockDispatch)
    ;(useSelector as jest.Mock).mockReturnValue(1.5)
  })

  it('should return zoom value from selector', () => {
    const { result } = renderHook(() => useEditorZoom())
    expect(result.current.zoom).toBe(1.5)
  })

  it('setZoom should dispatch setZoom action', () => {
    const { result } = renderHook(() => useEditorZoom())
    act(() => { result.current.setZoom(2.0) })
    expect(mockDispatch).toHaveBeenCalledWith(setZoom(2.0))
  })

  it('zoomIn should dispatch zoomIn action', () => {
    const { result } = renderHook(() => useEditorZoom())
    act(() => { result.current.zoomIn() })
    expect(mockDispatch).toHaveBeenCalledWith(zoomIn())
  })

  it('zoomOut should dispatch zoomOut action', () => {
    const { result } = renderHook(() => useEditorZoom())
    act(() => { result.current.zoomOut() })
    expect(mockDispatch).toHaveBeenCalledWith(zoomOut())
  })

  it('resetZoom should dispatch resetZoom action', () => {
    const { result } = renderHook(() => useEditorZoom())
    act(() => { result.current.resetZoom() })
    expect(mockDispatch).toHaveBeenCalledWith(resetZoom())
  })

  it('should expose all expected methods', () => {
    const { result } = renderHook(() => useEditorZoom())
    expect(typeof result.current.setZoom).toBe('function')
    expect(typeof result.current.zoomIn).toBe('function')
    expect(typeof result.current.zoomOut).toBe('function')
    expect(typeof result.current.resetZoom).toBe('function')
  })
})

describe('useEditorPan', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useDispatch as jest.Mock).mockReturnValue(mockDispatch)
    ;(useSelector as jest.Mock).mockReturnValue({ x: 10, y: 20 })
  })

  it('should return pan value from selector', () => {
    const { result } = renderHook(() => useEditorPan())
    expect(result.current.pan).toEqual({ x: 10, y: 20 })
  })

  it('setPan should dispatch setPan action with x, y', () => {
    const { result } = renderHook(() => useEditorPan())
    act(() => { result.current.setPan(100, 200) })
    expect(mockDispatch).toHaveBeenCalledWith(setPan({ x: 100, y: 200 }))
  })

  it('panBy should dispatch panBy action with dx, dy', () => {
    const { result } = renderHook(() => useEditorPan())
    act(() => { result.current.panBy(50, -25) })
    expect(mockDispatch).toHaveBeenCalledWith(panBy({ dx: 50, dy: -25 }))
  })

  it('resetPan should dispatch resetPan action', () => {
    const { result } = renderHook(() => useEditorPan())
    act(() => { result.current.resetPan() })
    expect(mockDispatch).toHaveBeenCalledWith(resetPan())
  })

  it('should expose all expected methods', () => {
    const { result } = renderHook(() => useEditorPan())
    expect(typeof result.current.setPan).toBe('function')
    expect(typeof result.current.panBy).toBe('function')
    expect(typeof result.current.resetPan).toBe('function')
  })
})
