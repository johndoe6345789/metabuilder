/**
 * Tests for useEditor composite hook
 */

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}))

jest.mock('@metabuilder/redux-slices', () => ({
  editorSlice: {
    actions: {
      // Zoom actions
      setZoom: jest.fn((v) => ({ type: 'editor/setZoom', payload: v })),
      zoomIn: jest.fn(() => ({ type: 'editor/zoomIn' })),
      zoomOut: jest.fn(() => ({ type: 'editor/zoomOut' })),
      resetZoom: jest.fn(() => ({ type: 'editor/resetZoom' })),
      // Pan actions
      setPan: jest.fn((v) => ({ type: 'editor/setPan', payload: v })),
      panBy: jest.fn((v) => ({ type: 'editor/panBy', payload: v })),
      resetPan: jest.fn(() => ({ type: 'editor/resetPan' })),
      // Selection actions
      selectNode: jest.fn((v) => ({ type: 'editor/selectNode', payload: v })),
      addNodeToSelection: jest.fn((v) => ({ type: 'editor/addNodeToSelection', payload: v })),
      removeNodeFromSelection: jest.fn((v) => ({ type: 'editor/removeNodeFromSelection', payload: v })),
      toggleNodeSelection: jest.fn((v) => ({ type: 'editor/toggleNodeSelection', payload: v })),
      clearSelection: jest.fn(() => ({ type: 'editor/clearSelection' })),
      setSelection: jest.fn((v) => ({ type: 'editor/setSelection', payload: v })),
      // Edge/canvas actions
      selectEdge: jest.fn((v) => ({ type: 'editor/selectEdge', payload: v })),
      addEdgeToSelection: jest.fn((v) => ({ type: 'editor/addEdgeToSelection', payload: v })),
      removeEdgeFromSelection: jest.fn((v) => ({ type: 'editor/removeEdgeFromSelection', payload: v })),
      setDrawing: jest.fn((v) => ({ type: 'editor/setDrawing', payload: v })),
      showContextMenu: jest.fn((v) => ({ type: 'editor/showContextMenu', payload: v })),
      hideContextMenu: jest.fn(() => ({ type: 'editor/hideContextMenu' })),
      setCanvasSize: jest.fn((v) => ({ type: 'editor/setCanvasSize', payload: v })),
      resetEditor: jest.fn(() => ({ type: 'editor/resetEditor' })),
    },
  },
}))

import { renderHook, act } from '@testing-library/react'
import { useDispatch, useSelector } from 'react-redux'
import { editorSlice } from '@metabuilder/redux-slices'
import { useEditor } from '../useEditor'

const mockDispatch = jest.fn()
const actions = editorSlice.actions

function setupMocks() {
  ;(useDispatch as jest.Mock).mockReturnValue(mockDispatch)
  ;(useSelector as jest.Mock).mockImplementation((selector: any) => {
    const storeState = {
      editor: {
        zoom: 1,
        pan: { x: 0, y: 0 },
        selectedNodes: new Set<string>(),
        selectedEdges: new Set<string>(),
        isDrawing: false,
        contextMenu: null,
        canvasSize: { width: 1000, height: 700 },
      },
    }
    return selector(storeState)
  })
}

describe('useEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupMocks()
  })

  it('should return zoom from state', () => {
    const { result } = renderHook(() => useEditor())
    expect(result.current.zoom).toBe(1)
  })

  it('should return pan from state', () => {
    const { result } = renderHook(() => useEditor())
    expect(result.current.pan).toEqual({ x: 0, y: 0 })
  })

  it('should expose zoom actions', () => {
    const { result } = renderHook(() => useEditor())
    expect(typeof result.current.setZoom).toBe('function')
    expect(typeof result.current.zoomIn).toBe('function')
    expect(typeof result.current.zoomOut).toBe('function')
    expect(typeof result.current.resetZoom).toBe('function')
  })

  it('should expose pan actions', () => {
    const { result } = renderHook(() => useEditor())
    expect(typeof result.current.setPan).toBe('function')
    expect(typeof result.current.panBy).toBe('function')
    expect(typeof result.current.resetPan).toBe('function')
  })

  it('should expose selection actions', () => {
    const { result } = renderHook(() => useEditor())
    expect(typeof result.current.selectNode).toBe('function')
    expect(typeof result.current.clearSelection).toBe('function')
  })

  it('fitToScreen should dispatch resetZoom and resetPan', () => {
    const { result } = renderHook(() => useEditor())
    act(() => { result.current.fitToScreen() })
    expect(mockDispatch).toHaveBeenCalledWith(actions.resetZoom())
    expect(mockDispatch).toHaveBeenCalledWith(actions.resetPan())
  })

  it('centerOnNode should dispatch setPan to center the node', () => {
    const { result } = renderHook(() => useEditor())
    const nodes = [{ id: 'n1', position: { x: 200, y: 100 }, width: 100, height: 50 }]

    act(() => { result.current.centerOnNode('n1', nodes) })

    // canvasSize is 1000x700, node center is (250, 125)
    // expected pan: { x: 500 - 250, y: 350 - 125 } = { x: 250, y: 225 }
    expect(mockDispatch).toHaveBeenCalledWith(
      actions.setPan({ x: 1000 / 2 - (200 + 100 / 2), y: 700 / 2 - (100 + 50 / 2) })
    )
  })

  it('centerOnNode should not dispatch when nodeId not found', () => {
    const { result } = renderHook(() => useEditor())
    const nodes = [{ id: 'n1', position: { x: 200, y: 100 }, width: 100, height: 50 }]

    act(() => { result.current.centerOnNode('nonexistent', nodes) })

    expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'editor/setPan' }))
  })
})
