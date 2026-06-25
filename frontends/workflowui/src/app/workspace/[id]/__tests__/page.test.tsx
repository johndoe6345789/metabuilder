/**
 * Tests for WorkspacePage (app/workspace/[id]/page.tsx)
 */

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  useParams: jest.fn(() => ({ id: 'ws-1' })),
  usePathname: jest.fn(() => '/workspace/ws-1'),
}))

jest.mock('../hooks/useWorkspacePage', () => ({
  useWorkspacePage: jest.fn(),
}))

jest.mock('../WorkspaceProjectsBody', () => ({
  __esModule: true,
  default: ({
    starredProjects,
    regularProjects,
    showCreateForm,
    newProjectName,
    setNewProjectName,
    onSubmitCreate,
    onCancelCreate,
  }: any) => (
    <div data-testid="projects-body">
      <span data-testid="starred-count">{starredProjects.length}</span>
      <span data-testid="regular-count">{regularProjects.length}</span>
      {showCreateForm && (
        <div data-testid="create-form">
          <input
            data-testid="project-name-input"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
          <button data-testid="submit-create" onClick={onSubmitCreate}>Submit</button>
          <button data-testid="cancel-create" onClick={onCancelCreate}>Cancel</button>
        </div>
      )}
    </div>
  ),
}))

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import WorkspacePage from '../page'
import { useWorkspacePage } from '../hooks/useWorkspacePage'

const mockSetShowCreateForm = jest.fn()
const mockSetNewProjectName = jest.fn()
const mockHandleCreateProject = jest.fn()

function setupMocks(overrides: any = {}) {
  ;(useWorkspacePage as jest.Mock).mockReturnValue({
    workspaceId: 'ws-1',
    currentWorkspace: { id: 'ws-1', name: 'My Workspace', description: 'A workspace' },
    isLoading: false,
    showCreateForm: false,
    setShowCreateForm: mockSetShowCreateForm,
    newProjectName: '',
    setNewProjectName: mockSetNewProjectName,
    handleCreateProject: mockHandleCreateProject,
    starredProjects: [],
    regularProjects: [],
    ...overrides,
  })
}

describe('WorkspacePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupMocks()
  })

  it('should render workspace name as title', () => {
    render(<WorkspacePage />)
    expect(screen.getByText('My Workspace')).toBeInTheDocument()
  })

  it('should render workspace description', () => {
    render(<WorkspacePage />)
    expect(screen.getByText('A workspace')).toBeInTheDocument()
  })

  it('should show default name when no currentWorkspace', () => {
    setupMocks({ currentWorkspace: null })
    render(<WorkspacePage />)
    expect(screen.getByText('Workspace')).toBeInTheDocument()
  })

  it('should show default description when workspace has no description', () => {
    setupMocks({ currentWorkspace: { id: 'ws-1', name: 'WS', description: '' } })
    render(<WorkspacePage />)
    expect(screen.getByText('Organize your projects')).toBeInTheDocument()
  })

  it('should show loading spinner when isLoading is true', () => {
    setupMocks({ isLoading: true })
    render(<WorkspacePage />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should not show projects body when loading', () => {
    setupMocks({ isLoading: true })
    render(<WorkspacePage />)
    expect(screen.queryByTestId('projects-body')).not.toBeInTheDocument()
  })

  it('should show projects body when not loading', () => {
    render(<WorkspacePage />)
    expect(screen.getByTestId('projects-body')).toBeInTheDocument()
  })

  it('should call setShowCreateForm(true) when New Project button clicked', () => {
    render(<WorkspacePage />)
    fireEvent.click(screen.getByText('New Project'))
    expect(mockSetShowCreateForm).toHaveBeenCalledWith(true)
  })

  it('should pass starredProjects count to body', () => {
    setupMocks({
      starredProjects: [{ id: 'p-1', name: 'P1', starred: true }],
      regularProjects: [{ id: 'p-2', name: 'P2', starred: false }],
    })
    render(<WorkspacePage />)
    expect(screen.getByTestId('starred-count')).toHaveTextContent('1')
    expect(screen.getByTestId('regular-count')).toHaveTextContent('1')
  })

  it('should render New Project button', () => {
    render(<WorkspacePage />)
    expect(screen.getByText('New Project')).toBeInTheDocument()
  })

  it('should show create form when showCreateForm is true', () => {
    setupMocks({ showCreateForm: true })
    render(<WorkspacePage />)
    expect(screen.getByTestId('create-form')).toBeInTheDocument()
  })

  it('should call setShowCreateForm(false) and setNewProjectName("") when cancel clicked', () => {
    setupMocks({ showCreateForm: true })
    render(<WorkspacePage />)
    fireEvent.click(screen.getByTestId('cancel-create'))
    expect(mockSetShowCreateForm).toHaveBeenCalledWith(false)
    expect(mockSetNewProjectName).toHaveBeenCalledWith('')
  })
})
