/**
 * Tests for ProjectCanvasPage (app/project/[id]/page.tsx)
 */

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  useParams: jest.fn(() => ({ id: 'proj-1' })),
  usePathname: jest.fn(() => '/project/proj-1'),
}))

jest.mock('../hooks/useProjectCanvas', () => ({
  useProjectCanvasPage: jest.fn(),
}))

jest.mock('../CanvasAppBar', () => ({
  __esModule: true,
  default: ({ projectName, workflowCount }: any) => (
    <div data-testid="canvas-appbar">
      <span>{projectName}</span>
      <span data-testid="workflow-count">{workflowCount}</span>
    </div>
  ),
}))

jest.mock('../WorkflowCardItem', () => ({
  __esModule: true,
  default: ({ workflow, onCardClick }: any) => (
    <div data-testid={`workflow-card-${workflow.id}`} onClick={() => onCardClick(workflow.id)}>
      {workflow.name}
    </div>
  ),
}))

jest.mock('../CanvasZoomControls', () => ({
  __esModule: true,
  default: ({ onZoomIn, onZoomOut, onReset }: any) => (
    <div data-testid="zoom-controls">
      <button data-testid="zoom-in" onClick={onZoomIn}>+</button>
      <button data-testid="zoom-out" onClick={onZoomOut}>-</button>
      <button data-testid="zoom-reset" onClick={onReset}>Reset</button>
    </div>
  ),
}))

jest.mock('../CanvasViewport', () => ({
  __esModule: true,
  default: ({ children, onDragOver, onDrop }: any) => (
    <div data-testid="canvas-viewport" onDragOver={onDragOver} onDrop={onDrop}>
      {children}
    </div>
  ),
}))

jest.mock('../CanvasLoadingState', () => ({
  __esModule: true,
  default: () => <div data-testid="loading-state" />,
}))

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ProjectCanvasPage from '../page'
import { useProjectCanvasPage } from '../hooks/useProjectCanvas'

const mockSetCanvasZoom = jest.fn()
const mockSetCanvasPan = jest.fn()
const mockHandleCardClick = jest.fn()
const mockHandleCardDragStart = jest.fn()
const mockHandleCanvasDragOver = jest.fn()
const mockHandleCanvasDrop = jest.fn()
const mockSuccess = jest.fn()
const mockFormatDate = jest.fn((d: string) => d)
const mockGetStatusColor = jest.fn(() => 'green')
const mockGetStatusBorderColor = jest.fn(() => 'green')

function setupMocks(overrides: any = {}) {
  ;(useProjectCanvasPage as jest.Mock).mockReturnValue({
    projectId: 'proj-1',
    currentProject: { id: 'proj-1', name: 'My Project' },
    workflows: [],
    workflowsLoading: false,
    canvasZoom: 1,
    setCanvasZoom: mockSetCanvasZoom,
    canvasPan: { x: 0, y: 0 },
    setCanvasPan: mockSetCanvasPan,
    handleCardClick: mockHandleCardClick,
    handleCardDragStart: mockHandleCardDragStart,
    handleCanvasDragOver: mockHandleCanvasDragOver,
    handleCanvasDrop: mockHandleCanvasDrop,
    formatDate: mockFormatDate,
    getStatusColor: mockGetStatusColor,
    getStatusBorderColor: mockGetStatusBorderColor,
    success: mockSuccess,
    ...overrides,
  })
}

describe('ProjectCanvasPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupMocks()
  })

  it('should show loading state when workflowsLoading is true', () => {
    setupMocks({ workflowsLoading: true })
    render(<ProjectCanvasPage />)
    expect(screen.getByTestId('loading-state')).toBeInTheDocument()
  })

  it('should not show loading state when not loading', () => {
    render(<ProjectCanvasPage />)
    expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument()
  })

  it('should render CanvasAppBar with project name', () => {
    render(<ProjectCanvasPage />)
    expect(screen.getByTestId('canvas-appbar')).toBeInTheDocument()
    expect(screen.getByText('My Project')).toBeInTheDocument()
  })

  it('should render workflow count in AppBar', () => {
    setupMocks({ workflows: [{ id: 'w-1', name: 'WF 1' }, { id: 'w-2', name: 'WF 2' }] })
    render(<ProjectCanvasPage />)
    expect(screen.getByTestId('workflow-count')).toHaveTextContent('2')
  })

  it('should render workflow cards for each workflow', () => {
    setupMocks({
      workflows: [
        { id: 'w-1', name: 'Workflow 1' },
        { id: 'w-2', name: 'Workflow 2' },
      ],
    })
    render(<ProjectCanvasPage />)
    expect(screen.getByTestId('workflow-card-w-1')).toBeInTheDocument()
    expect(screen.getByTestId('workflow-card-w-2')).toBeInTheDocument()
  })

  it('should call handleCardClick when workflow card clicked', () => {
    setupMocks({ workflows: [{ id: 'w-1', name: 'Test WF' }] })
    render(<ProjectCanvasPage />)
    fireEvent.click(screen.getByTestId('workflow-card-w-1'))
    expect(mockHandleCardClick).toHaveBeenCalledWith('w-1')
  })

  it('should render zoom controls', () => {
    render(<ProjectCanvasPage />)
    expect(screen.getByTestId('zoom-controls')).toBeInTheDocument()
  })

  it('should call setCanvasZoom when zoom in clicked', () => {
    render(<ProjectCanvasPage />)
    fireEvent.click(screen.getByTestId('zoom-in'))
    expect(mockSetCanvasZoom).toHaveBeenCalled()
  })

  it('should call setCanvasZoom when zoom out clicked', () => {
    render(<ProjectCanvasPage />)
    fireEvent.click(screen.getByTestId('zoom-out'))
    expect(mockSetCanvasZoom).toHaveBeenCalled()
  })

  it('should call setCanvasZoom and setCanvasPan when zoom reset clicked', () => {
    render(<ProjectCanvasPage />)
    fireEvent.click(screen.getByTestId('zoom-reset'))
    expect(mockSetCanvasZoom).toHaveBeenCalledWith(1)
    expect(mockSetCanvasPan).toHaveBeenCalledWith({ x: 0, y: 0 })
  })

  it('should render canvas viewport', () => {
    render(<ProjectCanvasPage />)
    expect(screen.getByTestId('canvas-viewport')).toBeInTheDocument()
  })
})
