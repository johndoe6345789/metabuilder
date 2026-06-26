/**
 * Tests for Dashboard page (app/page.tsx)
 */

// moduleNameMapper already handles @metabuilder/m3 → m3Mock.tsx
// and scss → identity-obj-proxy, so no need to re-mock those.

jest.mock('@icons/react', () => ({
  AddIcon: () => null,
}))

// Mock the hooks barrel - Dashboard uses useDashboardLogic from '../hooks'
jest.mock('../../hooks', () => ({
  useDashboardLogic: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), back: jest.fn() })),
  useParams: jest.fn(() => ({})),
  usePathname: jest.fn(() => '/'),
}))

// Mock sub-components
jest.mock('../DashboardStatsBanner', () => ({
  __esModule: true,
  default: () => <div data-testid="stats-banner" />,
}))

jest.mock('../WorkspaceCard', () => ({
  __esModule: true,
  default: ({ workspace, onClick }: any) => (
    <div data-testid={`workspace-card-${workspace.id}`} onClick={onClick}>{workspace.name}</div>
  ),
}))

jest.mock('../WorkspaceEmptyState', () => ({
  __esModule: true,
  default: ({ onCreateWorkspace }: any) => (
    <div data-testid="empty-state">
      <button onClick={onCreateWorkspace} data-testid="create-from-empty">Create</button>
    </div>
  ),
}))

jest.mock('../CreateWorkspaceForm', () => ({
  __esModule: true,
  default: ({ name, onSubmit, onCancel }: any) => (
    <div data-testid="create-form">
      <button onClick={onSubmit} data-testid="submit-form">Submit</button>
      <button onClick={onCancel} data-testid="cancel-form">Cancel</button>
    </div>
  ),
}))

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Dashboard from '../page'
import { useDashboardLogic } from '../../hooks'

const mockSetShowCreateForm = jest.fn()
const mockSetNewWorkspaceName = jest.fn()
const mockHandleCreateWorkspace = jest.fn()
const mockHandleWorkspaceClick = jest.fn()
const mockResetWorkspaceForm = jest.fn()

function setupMocks(overrides: any = {}) {
  ;(useDashboardLogic as jest.Mock).mockReturnValue({
    isLoading: false,
    showCreateForm: false,
    newWorkspaceName: '',
    workspaces: [],
    setShowCreateForm: mockSetShowCreateForm,
    setNewWorkspaceName: mockSetNewWorkspaceName,
    handleCreateWorkspace: mockHandleCreateWorkspace,
    handleWorkspaceClick: mockHandleWorkspaceClick,
    resetWorkspaceForm: mockResetWorkspaceForm,
    ...overrides,
  })
}

describe('Dashboard page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupMocks()
  })

  it('should render the page title', () => {
    render(<Dashboard />)
    expect(screen.getByText('Workspaces')).toBeInTheDocument()
  })

  it('should render the New Workspace button', () => {
    render(<Dashboard />)
    expect(screen.getByText('New Workspace')).toBeInTheDocument()
  })

  it('should show loading spinner when isLoading is true', () => {
    setupMocks({ isLoading: true })
    render(<Dashboard />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should show empty state when no workspaces', () => {
    render(<Dashboard />)
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })

  it('should show workspace cards when workspaces exist', () => {
    setupMocks({
      workspaces: [
        { id: 'ws-1', name: 'Workspace 1' },
        { id: 'ws-2', name: 'Workspace 2' },
      ],
    })
    render(<Dashboard />)
    expect(screen.getByTestId('workspace-card-ws-1')).toBeInTheDocument()
    expect(screen.getByTestId('workspace-card-ws-2')).toBeInTheDocument()
  })

  it('should call setShowCreateForm(true) when New Workspace button clicked', () => {
    render(<Dashboard />)
    fireEvent.click(screen.getByText('New Workspace'))
    expect(mockSetShowCreateForm).toHaveBeenCalledWith(true)
  })

  it('should show create form when showCreateForm is true', () => {
    setupMocks({ showCreateForm: true })
    render(<Dashboard />)
    expect(screen.getByTestId('create-form')).toBeInTheDocument()
  })

  it('should not show empty state when showCreateForm is true', () => {
    setupMocks({ showCreateForm: true, workspaces: [] })
    render(<Dashboard />)
    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
  })

  it('should call handleWorkspaceClick when workspace card is clicked', () => {
    setupMocks({ workspaces: [{ id: 'ws-1', name: 'My Workspace' }] })
    render(<Dashboard />)
    fireEvent.click(screen.getByTestId('workspace-card-ws-1'))
    expect(mockHandleWorkspaceClick).toHaveBeenCalledWith('ws-1')
  })

  it('should render DashboardStatsBanner', () => {
    render(<Dashboard />)
    expect(screen.getByTestId('stats-banner')).toBeInTheDocument()
  })
})
