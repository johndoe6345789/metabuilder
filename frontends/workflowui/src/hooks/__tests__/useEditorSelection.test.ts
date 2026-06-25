/**
 * Tests for useEditorSelection hook
 */

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}))

jest.mock('@metabuilder/redux-slices', () => ({
  editorSlice: {
    actions: {
      selectNode: jest.fn((v) => ({ type: 'editor/selectNode', payload: v })),
      addNodeToSelection: jest.fn((v) => ({ type: 'editor/addNodeToSelection', payload: v })),
      removeNodeFromSelection: jest.fn((v) => ({ type: 'editor/removeNodeFromSelection', payload: v })),
      toggleNodeSelection: jest.fn((v) => ({ type: 'editor/toggleNodeSelection', payload: v })),
      clearSelection: jest.fn(() => ({ type: 'editor/clearSelection' })),
      setSelection: jest.fn((v) => ({ type: 'editor/setSelection', payload: v })),
      resetZoom: jest.fn(() => ({ type: 'editor/resetZoom' })),
      resetPan: jest.fn(() => ({ type: 'editor/resetPan' })),
      setPan: jest.fn((v) => ({ type: 'editor/setPan', payload: v })),
      // For useEditorEdgeSelection
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
import { useEditorSelection } from '../useEditorSelection'

const mockDispatch = jest.fn()
const actions = editorSlice.actions

describe('useEditorSelection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useDispatch as jest.Mock).mockReturnValue(mockDispatch)
    ;(useSelector as jest.Mock).mockImplementation((selector: any) => {
      const storeState = {
        editor: {
          selectedNodes: new Set<string>(),
          selectedEdges: new Set<string>(),
          isDrawing: false,
          contextMenu: null,
          canvasSize: { width: 800, height: 600 },
        },
      }
      return selector(storeState)
    })
  })

  it('should return selectedNodes from state', () => {
    const selectedNodes = new Set(['node-1'])
    ;(useSelector as jest.Mock).mockImplementation((selector: any) => {
      const storeState = {
        editor: {
          selectedNodes,
          selectedEdges: new Set<string>(),
          isDrawing: false,
          contextMenu: null,
          canvasSize: { width: 800, height: 600 },
        },
      }
      return selector(storeState)
    })
    const { result } = renderHook(() => useEditorSelection())
    expect(result.current.selectedNodes).toEqual(selectedNodes)
  })

  it('selectNode should dispatch selectNode action', () => {
    const { result } = renderHook(() => useEditorSelection())
    act(() => { result.current.selectNode('node-1') })
    expect(mockDispatch).toHaveBeenCalledWith(actions.selectNode('node-1'))
  })

  it('addNodeToSelection should dispatch addNodeToSelection', () => {
    const { result } = renderHook(() => useEditorSelection())
    act(() => { result.current.addNodeToSelection('node-2') })
    expect(mockDispatch).toHaveBeenCalledWith(actions.addNodeToSelection('node-2'))
  })

  it('removeNodeFromSelection should dispatch removeNodeFromSelection', () => {
    const { result } = renderHook(() => useEditorSelection())
    act(() => { result.current.removeNodeFromSelection('node-3') })
    expect(mockDispatch).toHaveBeenCalledWith(actions.removeNodeFromSelection('node-3'))
  })

  it('toggleNodeSelection should dispatch toggleNodeSelection', () => {
    const { result } = renderHook(() => useEditorSelection())
    act(() => { result.current.toggleNodeSelection('node-4') })
    expect(mockDispatch).toHaveBeenCalledWith(actions.toggleNodeSelection('node-4'))
  })

  it('clearSelection should dispatch clearSelection', () => {
    const { result } = renderHook(() => useEditorSelection())
    act(() => { result.current.clearSelection() })
    expect(mockDispatch).toHaveBeenCalledWith(actions.clearSelection())
  })

  it('setSelection should dispatch setSelection with nodes and edges', () => {
    const { result } = renderHook(() => useEditorSelection())
    act(() => { result.current.setSelection(['n1', 'n2'], ['e1']) })
    expect(mockDispatch).toHaveBeenCalledWith(actions.setSelection({ nodes: ['n1', 'n2'], edges: ['e1'] }))
  })

  it('should also expose edgeSelection properties', () => {
    const { result } = renderHook(() => useEditorSelection())
    expect(result.current).toHaveProperty('selectedEdges')
    expect(result.current).toHaveProperty('isDrawing')
    expect(result.current).toHaveProperty('contextMenu')
    expect(result.current).toHaveProperty('canvasSize')
    expect(typeof result.current.selectEdge).toBe('function')
    expect(typeof result.current.hideContextMenu).toBe('function')
  })
})
