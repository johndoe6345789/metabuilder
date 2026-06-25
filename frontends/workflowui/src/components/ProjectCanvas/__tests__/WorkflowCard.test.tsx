/**
 * Tests for WorkflowCard component
 */

jest.mock('../hooks/useWorkflowCard', () => ({
  useWorkflowCard: jest.fn(),
}))

jest.mock('../WorkflowCardHeader', () => ({
  __esModule: true,
  default: ({ name, workflowId, itemId, onOpen, onDelete }: any) => (
    <div data-testid="workflow-card-header">
      <span data-testid="card-name">{name}</span>
      <button data-testid="open-btn" onClick={() => onOpen && onOpen()}>Open</button>
      <button data-testid="delete-btn" onClick={() => onDelete && onDelete(itemId)}>Delete</button>
    </div>
  ),
}))

jest.mock('../WorkflowCardResizeHandles', () => ({
  __esModule: true,
  default: ({ onResizeStart }: any) => (
    <div data-testid="resize-handles" onMouseDown={onResizeStart} />
  ),
}))

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { WorkflowCard } from '../WorkflowCard'
import { useWorkflowCard } from '../hooks/useWorkflowCard'

const mockHandleSelect = jest.fn()
const mockHandleDragStart = jest.fn()
const mockHandleResizeStart = jest.fn()

const mockCardRef = { current: null }

function setupMocks() {
  ;(useWorkflowCard as jest.Mock).mockReturnValue({
    cardRef: mockCardRef,
    handleSelect: mockHandleSelect,
    handleDragStart: mockHandleDragStart,
    handleResizeStart: mockHandleResizeStart,
  })
}

const defaultItem = {
  id: 'item-1',
  position: { x: 100, y: 200 },
  size: { width: 300, height: 200 },
  color: '#ff0000',
  zIndex: 1,
  minimized: false,
}

const defaultWorkflow = {
  id: 'wf-1',
  name: 'Test Workflow',
  nodes: [{ id: 'n1' }, { id: 'n2' }],
  connections: [{ id: 'c1' }],
}

const defaultProps = {
  item: defaultItem,
  workflow: defaultWorkflow,
  isSelected: false,
  onSelect: jest.fn(),
  onUpdatePosition: jest.fn(),
  onUpdateSize: jest.fn(),
  onDelete: jest.fn(),
  onOpen: jest.fn(),
  zoom: 1,
  snap_to_grid: (pos: any) => pos,
}

describe('WorkflowCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupMocks()
  })

  it('should render the card', () => {
    render(<WorkflowCard {...defaultProps} />)
    expect(screen.getByTestId('workflow-card-header')).toBeInTheDocument()
  })

  it('should render workflow name', () => {
    render(<WorkflowCard {...defaultProps} />)
    expect(screen.getByTestId('card-name')).toHaveTextContent('Test Workflow')
  })

  it('should show node count', () => {
    render(<WorkflowCard {...defaultProps} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('should show node/connection summary', () => {
    render(<WorkflowCard {...defaultProps} />)
    expect(screen.getByText('2 nodes • 1 connections')).toBeInTheDocument()
  })

  it('should not show node count when minimized', () => {
    render(<WorkflowCard {...defaultProps} item={{ ...defaultItem, minimized: true }} />)
    // The node count div is hidden when minimized
    expect(screen.queryByText('2')).not.toBeInTheDocument()
  })

  it('should render resize handles', () => {
    render(<WorkflowCard {...defaultProps} />)
    expect(screen.getByTestId('resize-handles')).toBeInTheDocument()
  })

  it('should call handleSelect on mousedown', () => {
    render(<WorkflowCard {...defaultProps} />)
    const card = screen.getByTestId('workflow-card-header').parentElement!
    fireEvent.mouseDown(card)
    expect(mockHandleSelect).toHaveBeenCalled()
  })

  it('should handle zero nodes gracefully', () => {
    render(
      <WorkflowCard
        {...defaultProps}
        workflow={{ ...defaultWorkflow, nodes: [], connections: [] }}
      />
    )
    expect(screen.getByText('0 nodes • 0 connections')).toBeInTheDocument()
  })

  it('should handle null workflow gracefully', () => {
    render(<WorkflowCard {...defaultProps} workflow={undefined as any} />)
    expect(screen.getByText('0 nodes • 0 connections')).toBeInTheDocument()
  })

  it('should call onOpen when open button clicked', () => {
    const onOpen = jest.fn()
    render(<WorkflowCard {...defaultProps} onOpen={onOpen} />)
    fireEvent.click(screen.getByTestId('open-btn'))
    expect(onOpen).toHaveBeenCalled()
  })

  it('should call onDelete when delete button clicked', () => {
    const onDelete = jest.fn()
    render(<WorkflowCard {...defaultProps} onDelete={onDelete} />)
    fireEvent.click(screen.getByTestId('delete-btn'))
    expect(onDelete).toHaveBeenCalledWith('item-1')
  })
})
