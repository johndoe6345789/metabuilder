/**
 * Tests for useWorkspacePage hook
 */

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  useParams: jest.fn(() => ({ id: 'ws-1' })),
}))

const mockSwitchWorkspace = jest.fn()
const mockLoadProjects = jest.fn().mockResolvedValue(undefined)
const mockCreateProject = jest.fn().mockResolvedValue({ id: 'new-proj', name: 'New Project' })

jest.mock('../../../../../hooks', () => ({
  useWorkspace: jest.fn(() => ({
    currentWorkspace: { id: 'ws-1', name: 'My Workspace' },
    switchWorkspace: mockSwitchWorkspace,
  })),
  useProject: jest.fn(() => ({
    projects: [],
    loadProjects: mockLoadProjects,
    createProject: mockCreateProject,
  })),
}))

import { renderHook, act, waitFor } from '@testing-library/react'
import { useParams } from 'next/navigation'
import { useWorkspacePage } from '../useWorkspacePage'
import { useWorkspace, useProject } from '../../../../../hooks'

describe('useWorkspacePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useParams as jest.Mock).mockReturnValue({ id: 'ws-1' })
    ;(useWorkspace as jest.Mock).mockReturnValue({
      currentWorkspace: { id: 'ws-1', name: 'My Workspace' },
      switchWorkspace: mockSwitchWorkspace,
    })
    ;(useProject as jest.Mock).mockReturnValue({
      projects: [],
      loadProjects: mockLoadProjects,
      createProject: mockCreateProject,
    })
  })

  it('should return workspaceId from params', () => {
    const { result } = renderHook(() => useWorkspacePage())
    expect(result.current.workspaceId).toBe('ws-1')
  })

  it('should return currentWorkspace', () => {
    const { result } = renderHook(() => useWorkspacePage())
    expect(result.current.currentWorkspace?.name).toBe('My Workspace')
  })

  it('should call switchWorkspace and loadProjects on mount', async () => {
    renderHook(() => useWorkspacePage())
    await waitFor(() => {
      expect(mockSwitchWorkspace).toHaveBeenCalledWith('ws-1')
      expect(mockLoadProjects).toHaveBeenCalledWith('ws-1')
    })
  })

  it('should set isLoading to false after mount', async () => {
    const { result } = renderHook(() => useWorkspacePage())
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('should initialize showCreateForm as false', () => {
    const { result } = renderHook(() => useWorkspacePage())
    expect(result.current.showCreateForm).toBe(false)
  })

  it('should initialize newProjectName as empty string', () => {
    const { result } = renderHook(() => useWorkspacePage())
    expect(result.current.newProjectName).toBe('')
  })

  it('should update showCreateForm via setShowCreateForm', () => {
    const { result } = renderHook(() => useWorkspacePage())
    act(() => { result.current.setShowCreateForm(true) })
    expect(result.current.showCreateForm).toBe(true)
  })

  it('should update newProjectName via setNewProjectName', () => {
    const { result } = renderHook(() => useWorkspacePage())
    act(() => { result.current.setNewProjectName('My Project') })
    expect(result.current.newProjectName).toBe('My Project')
  })

  it('should separate starred and regular projects', () => {
    ;(useProject as jest.Mock).mockReturnValue({
      projects: [
        { id: 'p1', name: 'Starred', starred: true },
        { id: 'p2', name: 'Regular', starred: false },
        { id: 'p3', name: 'Also Regular', starred: false },
      ],
      loadProjects: mockLoadProjects,
      createProject: mockCreateProject,
    })
    const { result } = renderHook(() => useWorkspacePage())
    expect(result.current.starredProjects).toHaveLength(1)
    expect(result.current.regularProjects).toHaveLength(2)
  })

  it('handleCreateProject should not call createProject when name is empty', async () => {
    const { result } = renderHook(() => useWorkspacePage())
    const e = { preventDefault: jest.fn() }
    await act(async () => {
      await result.current.handleCreateProject(e as any)
    })
    expect(mockCreateProject).not.toHaveBeenCalled()
  })

  it('handleCreateProject should call createProject with name and workspaceId', async () => {
    const { result } = renderHook(() => useWorkspacePage())
    act(() => { result.current.setNewProjectName('Test Project') })
    const e = { preventDefault: jest.fn() }
    await act(async () => {
      await result.current.handleCreateProject(e as any)
    })
    expect(mockCreateProject).toHaveBeenCalledWith({
      name: 'Test Project',
      workspaceId: 'ws-1',
      description: '',
    })
  })

  it('handleCreateProject should reset form after successful creation', async () => {
    const { result } = renderHook(() => useWorkspacePage())
    act(() => { result.current.setNewProjectName('Test Project') })
    const e = { preventDefault: jest.fn() }
    await act(async () => {
      await result.current.handleCreateProject(e as any)
    })
    expect(result.current.newProjectName).toBe('')
    expect(result.current.showCreateForm).toBe(false)
  })

  it('should not call switchWorkspace when workspaceId is undefined', () => {
    ;(useParams as jest.Mock).mockReturnValue({})
    renderHook(() => useWorkspacePage())
    expect(mockSwitchWorkspace).not.toHaveBeenCalled()
  })
})
