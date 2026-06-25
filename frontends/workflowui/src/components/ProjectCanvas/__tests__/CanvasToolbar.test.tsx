/**
 * Tests for CanvasToolbar component
 */

jest.mock('../../../hooks/canvas', () => ({
  useProjectCanvas: jest.fn(),
}))

jest.mock('../CanvasZoomControls', () => ({
  __esModule: true,
  default: ({ zoom, onZoomIn, onZoomOut, onResetView }: any) => (
    <div data-testid="canvas-zoom-controls">
      <span data-testid="zoom-value">{zoom}</span>
      <button data-testid="zoom-in" onClick={onZoomIn}>+</button>
      <button data-testid="zoom-out" onClick={onZoomOut}>-</button>
      <button data-testid="reset-view" onClick={onResetView}>Reset</button>
    </div>
  ),
}))

jest.mock('../CanvasGridControls', () => ({
  __esModule: true,
  default: ({ showGrid, gridSnap, snapSize, onToggleShowGrid, onToggleGridSnap, onSnapSizeChange }: any) => (
    <div data-testid="canvas-grid-controls">
      <button data-testid="toggle-grid" onClick={onToggleShowGrid}>Grid</button>
      <button data-testid="toggle-snap" onClick={onToggleGridSnap}>Snap</button>
      <button data-testid="snap-size" onClick={() => onSnapSizeChange(25)}>{snapSize}</button>
    </div>
  ),
}))

jest.mock('../CanvasActionButtons', () => ({
  __esModule: true,
  default: ({ onAddWorkflow, onAutoLayout, onOpenSettings }: any) => (
    <div data-testid="canvas-action-buttons">
      <button data-testid="add-workflow" onClick={onAddWorkflow}>Add</button>
      <button data-testid="auto-layout" onClick={onAutoLayout}>Layout</button>
      <button data-testid="open-settings" onClick={onOpenSettings}>Settings</button>
    </div>
  ),
}))

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import CanvasToolbar from '../CanvasToolbar'
import { useProjectCanvas } from '../../../hooks/canvas'

const mockZoomIn = jest.fn()
const mockZoomOut = jest.fn()
const mockResetView = jest.fn()
const mockToggleGridSnap = jest.fn()
const mockToggleShowGrid = jest.fn()
const mockSetSnapSize = jest.fn()

function setupMocks(overrides: any = {}) {
  ;(useProjectCanvas as jest.Mock).mockReturnValue({
    zoom: 1,
    zoom_in: mockZoomIn,
    zoom_out: mockZoomOut,
    reset_view: mockResetView,
    gridSnap: true,
    toggle_grid_snap: mockToggleGridSnap,
    showGrid: true,
    toggle_show_grid: mockToggleShowGrid,
    snapSize: 20,
    set_snap_size: mockSetSnapSize,
    ...overrides,
  })
}

describe('CanvasToolbar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupMocks()
  })

  it('should render zoom controls', () => {
    render(<CanvasToolbar />)
    expect(screen.getByTestId('canvas-zoom-controls')).toBeInTheDocument()
  })

  it('should render grid controls', () => {
    render(<CanvasToolbar />)
    expect(screen.getByTestId('canvas-grid-controls')).toBeInTheDocument()
  })

  it('should render action buttons', () => {
    render(<CanvasToolbar />)
    expect(screen.getByTestId('canvas-action-buttons')).toBeInTheDocument()
  })

  it('should pass zoom value to zoom controls', () => {
    setupMocks({ zoom: 1.5 })
    render(<CanvasToolbar />)
    expect(screen.getByTestId('zoom-value')).toHaveTextContent('1.5')
  })

  it('should call zoom_in when zoom in clicked', () => {
    render(<CanvasToolbar />)
    fireEvent.click(screen.getByTestId('zoom-in'))
    expect(mockZoomIn).toHaveBeenCalled()
  })

  it('should call zoom_out when zoom out clicked', () => {
    render(<CanvasToolbar />)
    fireEvent.click(screen.getByTestId('zoom-out'))
    expect(mockZoomOut).toHaveBeenCalled()
  })

  it('should call reset_view when reset clicked', () => {
    render(<CanvasToolbar />)
    fireEvent.click(screen.getByTestId('reset-view'))
    expect(mockResetView).toHaveBeenCalled()
  })

  it('should call toggle_show_grid when grid toggle clicked', () => {
    render(<CanvasToolbar />)
    fireEvent.click(screen.getByTestId('toggle-grid'))
    expect(mockToggleShowGrid).toHaveBeenCalled()
  })

  it('should call toggle_grid_snap when snap toggle clicked', () => {
    render(<CanvasToolbar />)
    fireEvent.click(screen.getByTestId('toggle-snap'))
    expect(mockToggleGridSnap).toHaveBeenCalled()
  })

  it('should call set_snap_size when snap size changed', () => {
    render(<CanvasToolbar />)
    fireEvent.click(screen.getByTestId('snap-size'))
    expect(mockSetSnapSize).toHaveBeenCalledWith(25)
  })

  it('should pass onAddWorkflow to action buttons', () => {
    const onAddWorkflow = jest.fn()
    render(<CanvasToolbar onAddWorkflow={onAddWorkflow} />)
    fireEvent.click(screen.getByTestId('add-workflow'))
    expect(onAddWorkflow).toHaveBeenCalled()
  })

  it('should pass onAutoLayout to action buttons', () => {
    const onAutoLayout = jest.fn()
    render(<CanvasToolbar onAutoLayout={onAutoLayout} />)
    fireEvent.click(screen.getByTestId('auto-layout'))
    expect(onAutoLayout).toHaveBeenCalled()
  })

  it('should pass onOpenSettings to action buttons', () => {
    const onOpenSettings = jest.fn()
    render(<CanvasToolbar onOpenSettings={onOpenSettings} />)
    fireEvent.click(screen.getByTestId('open-settings'))
    expect(onOpenSettings).toHaveBeenCalled()
  })
})
