/**
 * Tests for useProjectCanvas - composite canvas hook
 */

jest.mock('@metabuilder/hooks', () => ({
  useCanvasZoom: jest.fn(),
  useCanvasPan: jest.fn(),
  useCanvasSelection: jest.fn(),
  useCanvasSettings: jest.fn(),
  useCanvasGridUtils: jest.fn(),
}))

jest.mock('../useCanvasItems', () => ({
  useCanvasItems: jest.fn(),
}))

jest.mock('../useCanvasItemsOperations', () => ({
  useCanvasItemsOperations: jest.fn(),
}))

import { renderHook } from '@testing-library/react'
import {
  useCanvasZoom, useCanvasPan, useCanvasSelection,
  useCanvasSettings, useCanvasGridUtils,
} from '@metabuilder/hooks'
import { useCanvasItems } from '../useCanvasItems'
import { useCanvasItemsOperations } from '../useCanvasItemsOperations'
import { useProjectCanvas } from '../useProjectCanvas'

const mockZoomIn = jest.fn()
const mockZoomOut = jest.fn()
const mockResetView = jest.fn()
const mockPanBy = jest.fn()
const mockSelectItem = jest.fn()
const mockAddToSelection = jest.fn()
const mockRemoveFromSelection = jest.fn()
const mockToggleSelection = jest.fn()
const mockClearSelection = jest.fn()
const mockSelectAllItems = jest.fn()
const mockSetDraggingState = jest.fn()
const mockLoadCanvasItems = jest.fn()
const mockCreateCanvasItem = jest.fn()
const mockUpdateCanvasItem = jest.fn()
const mockDeleteCanvasItem = jest.fn()
const mockBulkUpdateItems = jest.fn()
const mockSetResizingState = jest.fn()
const mockToggleGridSnap = jest.fn()
const mockToggleShowGrid = jest.fn()
const mockSetSnapSizeValue = jest.fn()
const mockSnapToGrid = jest.fn((pos: any) => pos)

function setupMocks() {
  ;(useCanvasZoom as jest.Mock).mockReturnValue({
    zoom: 1.5,
    zoomIn: mockZoomIn,
    zoomOut: mockZoomOut,
    resetView: mockResetView,
  })

  ;(useCanvasPan as jest.Mock).mockReturnValue({
    pan: { x: 10, y: 20 },
    panBy: mockPanBy,
    isDragging: false,
    setDraggingState: mockSetDraggingState,
  })

  ;(useCanvasSelection as jest.Mock).mockReturnValue({
    selectedItemIds: new Set(['item-1']),
    selectedItems: [{ id: 'item-1' }],
    selectItem: mockSelectItem,
    addToSelection: mockAddToSelection,
    removeFromSelection: mockRemoveFromSelection,
    toggleSelection: mockToggleSelection,
    clearSelection: mockClearSelection,
    selectAllItems: mockSelectAllItems,
  })

  ;(useCanvasSettings as jest.Mock).mockReturnValue({
    gridSnap: true,
    showGrid: true,
    snapSize: 20,
    toggleGridSnap: mockToggleGridSnap,
    toggleShowGrid: mockToggleShowGrid,
    setSnapSizeValue: mockSetSnapSizeValue,
  })

  ;(useCanvasGridUtils as jest.Mock).mockReturnValue({
    snapToGrid: mockSnapToGrid,
  })

  ;(useCanvasItems as jest.Mock).mockReturnValue({
    canvasItems: [{ id: 'ci-1' }],
    isLoading: false,
    error: null,
    isResizing: false,
    loadCanvasItems: mockLoadCanvasItems,
    deleteCanvasItem: mockDeleteCanvasItem,
    setResizingState: mockSetResizingState,
  })

  ;(useCanvasItemsOperations as jest.Mock).mockReturnValue({
    createCanvasItem: mockCreateCanvasItem,
    updateCanvasItem: mockUpdateCanvasItem,
    bulkUpdateItems: mockBulkUpdateItems,
  })
}

describe('useProjectCanvas', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupMocks()
  })

  it('should return zoom from zoomHook', () => {
    const { result } = renderHook(() => useProjectCanvas())
    expect(result.current.zoom).toBe(1.5)
  })

  it('should return pan from panHook', () => {
    const { result } = renderHook(() => useProjectCanvas())
    expect(result.current.pan).toEqual({ x: 10, y: 20 })
  })

  it('should return canvasItems from itemsHook', () => {
    const { result } = renderHook(() => useProjectCanvas())
    expect(result.current.canvasItems).toEqual([{ id: 'ci-1' }])
  })

  it('should return selectedItemIds from selectionHook', () => {
    const { result } = renderHook(() => useProjectCanvas())
    expect(result.current.selectedItemIds).toEqual(new Set(['item-1']))
  })

  it('should return gridSnap from settingsHook', () => {
    const { result } = renderHook(() => useProjectCanvas())
    expect(result.current.gridSnap).toBe(true)
  })

  it('should return showGrid from settingsHook', () => {
    const { result } = renderHook(() => useProjectCanvas())
    expect(result.current.showGrid).toBe(true)
  })

  it('should return isLoading from itemsHook', () => {
    const { result } = renderHook(() => useProjectCanvas())
    expect(result.current.isLoading).toBe(false)
  })

  it('should return isDragging from panHook', () => {
    const { result } = renderHook(() => useProjectCanvas())
    expect(result.current.isDragging).toBe(false)
  })

  it('should expose zoom_in as zoomHook.zoomIn', () => {
    const { result } = renderHook(() => useProjectCanvas())
    expect(result.current.zoom_in).toBe(mockZoomIn)
  })

  it('should expose pan_canvas as panHook.panBy', () => {
    const { result } = renderHook(() => useProjectCanvas())
    expect(result.current.pan_canvas).toBe(mockPanBy)
  })

  it('should expose select_item as selectionHook.selectItem', () => {
    const { result } = renderHook(() => useProjectCanvas())
    expect(result.current.select_item).toBe(mockSelectItem)
  })

  it('should expose select_clear as selectionHook.clearSelection', () => {
    const { result } = renderHook(() => useProjectCanvas())
    expect(result.current.select_clear).toBe(mockClearSelection)
  })

  it('should expose set_dragging as panHook.setDraggingState', () => {
    const { result } = renderHook(() => useProjectCanvas())
    expect(result.current.set_dragging).toBe(mockSetDraggingState)
  })

  it('should expose set_resizing as itemsHook.setResizingState', () => {
    const { result } = renderHook(() => useProjectCanvas())
    expect(result.current.set_resizing).toBe(mockSetResizingState)
  })

  it('should expose toggle_grid_snap from settingsHook', () => {
    const { result } = renderHook(() => useProjectCanvas())
    expect(result.current.toggle_grid_snap).toBe(mockToggleGridSnap)
  })

  it('should expose snap_to_grid from gridUtilsHook', () => {
    const { result } = renderHook(() => useProjectCanvas())
    expect(result.current.snap_to_grid).toBe(mockSnapToGrid)
  })

  it('should expose createCanvasItem from operationsHook', () => {
    const { result } = renderHook(() => useProjectCanvas())
    expect(result.current.createCanvasItem).toBe(mockCreateCanvasItem)
  })

  it('should expose deleteCanvasItem from itemsHook', () => {
    const { result } = renderHook(() => useProjectCanvas())
    expect(result.current.deleteCanvasItem).toBe(mockDeleteCanvasItem)
  })

  it('should expose bulkUpdateItems from operationsHook', () => {
    const { result } = renderHook(() => useProjectCanvas())
    expect(result.current.bulkUpdateItems).toBe(mockBulkUpdateItems)
  })
})
