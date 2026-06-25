/**
 * Tests for WorkflowsPage (app/workflows/page.tsx)
 */

jest.mock('@icons/react', () => ({
  AddIcon: () => null,
}))

jest.mock('../hooks/useWorkflowsPage', () => ({
  useWorkflowsPage: jest.fn(),
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}))

jest.mock('../WorkflowFilters', () => ({
  __esModule: true,
  default: ({ searchQuery, setSearchQuery }: any) => (
    <div data-testid="workflow-filters">
      <input
        data-testid="search-input"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  ),
}))

jest.mock('../WorkflowCard', () => ({
  __esModule: true,
  default: ({ workflow, onDelete }: any) => (
    <div data-testid={`workflow-card-${workflow.id}`}>
      <span>{workflow.name}</span>
      <button data-testid={`delete-${workflow.id}`} onClick={() => onDelete(workflow.id)}>
        Delete
      </button>
    </div>
  ),
}))

jest.mock('../WorkflowEmptyState', () => ({
  __esModule: true,
  default: ({ hasFilters }: any) => (
    <div data-testid="empty-state" data-has-filters={hasFilters} />
  ),
}))

jest.mock('../WorkflowErrorBanner', () => ({
  __esModule: true,
  default: ({ error }: any) => (
    error ? <div data-testid="error-banner">{error}</div> : null
  ),
}))

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import WorkflowsPage from '../page'
import { useWorkflowsPage } from '../hooks/useWorkflowsPage'

const mockSetSearchQuery = jest.fn()
const mockSetStatusFilter = jest.fn()
const mockSetCategoryFilter = jest.fn()
const mockHandleDelete = jest.fn()

function setupMocks(overrides: any = {}) {
  ;(useWorkflowsPage as jest.Mock).mockReturnValue({
    workflows: [],
    isLoading: false,
    error: null,
    searchQuery: '',
    setSearchQuery: mockSetSearchQuery,
    statusFilter: 'all',
    setStatusFilter: mockSetStatusFilter,
    categoryFilter: 'all',
    setCategoryFilter: mockSetCategoryFilter,
    handleDelete: mockHandleDelete,
    hasFilters: false,
    ...overrides,
  })
}

describe('WorkflowsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupMocks()
  })

  it('should render the page title', () => {
    render(<WorkflowsPage />)
    expect(screen.getByText('Workflows')).toBeInTheDocument()
  })

  it('should render New Workflow button', () => {
    render(<WorkflowsPage />)
    expect(screen.getByText('New Workflow')).toBeInTheDocument()
  })

  it('should show loading spinner when loading with no workflows', () => {
    setupMocks({ isLoading: true, workflows: [] })
    render(<WorkflowsPage />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should not show loading spinner when loading with existing workflows', () => {
    setupMocks({
      isLoading: true,
      workflows: [{ id: 'w-1', name: 'Workflow 1' }],
    })
    render(<WorkflowsPage />)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('should show empty state when no workflows', () => {
    render(<WorkflowsPage />)
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })

  it('should pass hasFilters to empty state', () => {
    setupMocks({ hasFilters: true })
    render(<WorkflowsPage />)
    expect(screen.getByTestId('empty-state')).toHaveAttribute('data-has-filters', 'true')
  })

  it('should render workflow cards when workflows exist', () => {
    setupMocks({
      workflows: [
        { id: 'w-1', name: 'Workflow 1' },
        { id: 'w-2', name: 'Workflow 2' },
      ],
    })
    render(<WorkflowsPage />)
    expect(screen.getByTestId('workflow-card-w-1')).toBeInTheDocument()
    expect(screen.getByTestId('workflow-card-w-2')).toBeInTheDocument()
  })

  it('should call handleDelete when delete button clicked', () => {
    setupMocks({ workflows: [{ id: 'w-1', name: 'Test Workflow' }] })
    render(<WorkflowsPage />)
    fireEvent.click(screen.getByTestId('delete-w-1'))
    expect(mockHandleDelete).toHaveBeenCalledWith('w-1')
  })

  it('should show error banner when error exists', () => {
    setupMocks({ error: 'Failed to load' })
    render(<WorkflowsPage />)
    expect(screen.getByTestId('error-banner')).toBeInTheDocument()
  })

  it('should not show error banner when no error', () => {
    render(<WorkflowsPage />)
    expect(screen.queryByTestId('error-banner')).not.toBeInTheDocument()
  })

  it('should render workflow filters', () => {
    render(<WorkflowsPage />)
    expect(screen.getByTestId('workflow-filters')).toBeInTheDocument()
  })

  it('should link New Workflow button to /editor/new', () => {
    render(<WorkflowsPage />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/editor/new')
  })
})
