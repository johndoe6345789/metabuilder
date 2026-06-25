/**
 * Tests for useNodeDrag hook
 */

jest.mock('../useNodeCrud', () => ({
  useNodeCrud: jest.fn(() => ({
    handleCanvasDrop: jest.fn(),
    handleUpdateConfig: jest.fn(),
    handleUpdateName: jest.fn(),
    handleDeleteNode: jest.fn(),
  })),
}))

jest.mock('../useNodeDragMove', () => ({
  useNodeDragMove: jest.fn(() => ({
    handleNodeDragMove: jest.fn(),
    handleNodeDragEnd: jest.fn(),
  })),
}))

import { renderHook, act } from '@testing-library/react'
import { useNodeDrag } from '../useNodeDrag'

const mockSetDraggingNodeId = jest.fn()
const mockSetDragOffset = jest.fn()
const mockSetWorkflow = jest.fn()

function makeWorkflow(overrides: any = {}) {
  return {
    id: 'wf-1',
    name: 'Test',
    description: '',
    nodes: [
      {
        id: 'n1',
        type: 'trigger.manual',
        name: 'Start',
        position: { x: 100, y: 200 },
        config: {},
        inputs: [],
        outputs: ['main'],
      },
    ],
    connections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

function makeParams(overrides: any = {}) {
  return {
    workflow: makeWorkflow(),
    setWorkflow: mockSetWorkflow,
    canvasOffset: { x: 0, y: 0 },
    zoom: 1,
    draggingNodeId: null,
    setDraggingNodeId: mockSetDraggingNodeId,
    dragOffset: { x: 0, y: 0 },
    setDragOffset: mockSetDragOffset,
    drawingConnection: null,
    setDrawingConnection: jest.fn(),
    canvasRef: { current: null },
    ...overrides,
  }
}

describe('useNodeDrag', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return selectedNodeId as null initially', () => {
    const { result } = renderHook(() => useNodeDrag(makeParams()))
    expect(result.current.selectedNodeId).toBeNull()
  })

  it('should return propertiesDialogOpen as false initially', () => {
    const { result } = renderHook(() => useNodeDrag(makeParams()))
    expect(result.current.propertiesDialogOpen).toBe(false)
  })

  it('should return selectedNode as null when no selection', () => {
    const { result } = renderHook(() => useNodeDrag(makeParams()))
    expect(result.current.selectedNode).toBeNull()
  })

  it('should select node via handleNodeSelect', () => {
    const { result } = renderHook(() => useNodeDrag(makeParams()))
    act(() => { result.current.handleNodeSelect('n1') })
    expect(result.current.selectedNodeId).toBe('n1')
  })

  it('should return selected node object when node is selected', () => {
    const { result } = renderHook(() => useNodeDrag(makeParams()))
    act(() => { result.current.handleNodeSelect('n1') })
    expect(result.current.selectedNode?.id).toBe('n1')
  })

  it('should open properties dialog on double click', () => {
    const { result } = renderHook(() => useNodeDrag(makeParams()))
    act(() => { result.current.handleNodeDoubleClick('n1') })
    expect(result.current.propertiesDialogOpen).toBe(true)
    expect(result.current.selectedNodeId).toBe('n1')
  })

  it('should set propertiesDialogOpen via setPropertiesDialogOpen', () => {
    const { result } = renderHook(() => useNodeDrag(makeParams()))
    act(() => { result.current.setPropertiesDialogOpen(true) })
    expect(result.current.propertiesDialogOpen).toBe(true)
  })

  it('should call setDraggingNodeId on handleNodeDragStart', () => {
    const { result } = renderHook(() => useNodeDrag(makeParams()))
    const e = { clientX: 150, clientY: 220 } as any
    act(() => { result.current.handleNodeDragStart(e, 'n1') })
    expect(mockSetDraggingNodeId).toHaveBeenCalledWith('n1')
  })

  it('should call setDragOffset on handleNodeDragStart', () => {
    const { result } = renderHook(() => useNodeDrag(makeParams()))
    const e = { clientX: 150, clientY: 220 } as any
    act(() => { result.current.handleNodeDragStart(e, 'n1') })
    expect(mockSetDragOffset).toHaveBeenCalledWith({
      x: 150 - 100 * 1 - 0,
      y: 220 - 200 * 1 - 0,
    })
  })

  it('should not call setDraggingNodeId when node not found', () => {
    const { result } = renderHook(() => useNodeDrag(makeParams()))
    const e = { clientX: 150, clientY: 220 } as any
    act(() => { result.current.handleNodeDragStart(e, 'nonexistent') })
    expect(mockSetDraggingNodeId).not.toHaveBeenCalled()
  })

  it('should return handleNodeDragMove from useNodeDragMove', () => {
    const { result } = renderHook(() => useNodeDrag(makeParams()))
    expect(typeof result.current.handleNodeDragMove).toBe('function')
  })

  it('should return handleNodeDragEnd from useNodeDragMove', () => {
    const { result } = renderHook(() => useNodeDrag(makeParams()))
    expect(typeof result.current.handleNodeDragEnd).toBe('function')
  })
})
