/**
 * Tests for useEditorEdgeSelection hook
 */

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}))

jest.mock('@metabuilder/redux-slices', () => ({
  editorSlice: {
    actions: {
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
import { useEditorEdgeSelection } from '../useEditorEdgeSelection'

const mockDispatch = jest.fn()
const actions = editorSlice.actions

function setupMocks(overrides: any = {}) {
  ;(useDispatch as jest.Mock).mockReturnValue(mockDispatch)
  ;(useSelector as jest.Mock).mockImplementation((selector: any) => {
    const storeState = {
      editor: {
        selectedEdges: new Set<string>(),
        isDrawing: false,
        contextMenu: null,
        canvasSize: { width: 1200, height: 800 },
        ...overrides,
      },
    }
    return selector(storeState)
  })
}

describe('useEditorEdgeSelection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupMocks()
  })

  it('should return selectedEdges from state', () => {
    const selectedEdges = new Set(['edge-1'])
    setupMocks({ selectedEdges })
    const { result } = renderHook(() => useEditorEdgeSelection())
    expect(result.current.selectedEdges).toEqual(selectedEdges)
  })

  it('should return isDrawing from state', () => {
    setupMocks({ isDrawing: true })
    const { result } = renderHook(() => useEditorEdgeSelection())
    expect(result.current.isDrawing).toBe(true)
  })

  it('should return contextMenu from state', () => {
    const contextMenu = { x: 100, y: 200 }
    setupMocks({ contextMenu })
    const { result } = renderHook(() => useEditorEdgeSelection())
    expect(result.current.contextMenu).toEqual(contextMenu)
  })

  it('should return canvasSize from state', () => {
    const { result } = renderHook(() => useEditorEdgeSelection())
    expect(result.current.canvasSize).toEqual({ width: 1200, height: 800 })
  })

  it('selectEdge should dispatch selectEdge action', () => {
    const { result } = renderHook(() => useEditorEdgeSelection())
    act(() => { result.current.selectEdge('edge-1') })
    expect(mockDispatch).toHaveBeenCalledWith(actions.selectEdge('edge-1'))
  })

  it('addEdgeToSelection should dispatch addEdgeToSelection action', () => {
    const { result } = renderHook(() => useEditorEdgeSelection())
    act(() => { result.current.addEdgeToSelection('edge-2') })
    expect(mockDispatch).toHaveBeenCalledWith(actions.addEdgeToSelection('edge-2'))
  })

  it('removeEdgeFromSelection should dispatch removeEdgeFromSelection action', () => {
    const { result } = renderHook(() => useEditorEdgeSelection())
    act(() => { result.current.removeEdgeFromSelection('edge-3') })
    expect(mockDispatch).toHaveBeenCalledWith(actions.removeEdgeFromSelection('edge-3'))
  })

  it('setDrawing should dispatch setDrawing action', () => {
    const { result } = renderHook(() => useEditorEdgeSelection())
    act(() => { result.current.setDrawing(true) })
    expect(mockDispatch).toHaveBeenCalledWith(actions.setDrawing(true))
  })

  it('showContextMenu should dispatch showContextMenu action', () => {
    const { result } = renderHook(() => useEditorEdgeSelection())
    act(() => { result.current.showContextMenu(100, 200, 'node-1') })
    expect(mockDispatch).toHaveBeenCalledWith(actions.showContextMenu({ x: 100, y: 200, nodeId: 'node-1' }))
  })

  it('showContextMenu should work without nodeId', () => {
    const { result } = renderHook(() => useEditorEdgeSelection())
    act(() => { result.current.showContextMenu(50, 75) })
    expect(mockDispatch).toHaveBeenCalledWith(actions.showContextMenu({ x: 50, y: 75, nodeId: undefined }))
  })

  it('hideContextMenu should dispatch hideContextMenu action', () => {
    const { result } = renderHook(() => useEditorEdgeSelection())
    act(() => { result.current.hideContextMenu() })
    expect(mockDispatch).toHaveBeenCalledWith(actions.hideContextMenu())
  })

  it('setCanvasSize should dispatch setCanvasSize action', () => {
    const { result } = renderHook(() => useEditorEdgeSelection())
    act(() => { result.current.setCanvasSize(1920, 1080) })
    expect(mockDispatch).toHaveBeenCalledWith(actions.setCanvasSize({ width: 1920, height: 1080 }))
  })

  it('reset should dispatch resetEditor action', () => {
    const { result } = renderHook(() => useEditorEdgeSelection())
    act(() => { result.current.reset() })
    expect(mockDispatch).toHaveBeenCalledWith(actions.resetEditor())
  })
})
