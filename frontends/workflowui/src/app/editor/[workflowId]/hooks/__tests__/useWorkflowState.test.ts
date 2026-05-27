/**
 * Tests for useWorkflowState hook
 */

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  useParams: jest.fn(() => ({ workflowId: 'wf-1' })),
}))

const mockGetWorkflow = jest.fn()
const mockCreateWorkflow = jest.fn()
const mockUpdateWorkflow = jest.fn()

jest.mock('@metabuilder/hooks', () => ({
  useWorkflows: jest.fn(() => ({
    getWorkflow: mockGetWorkflow,
    createWorkflow: mockCreateWorkflow,
    updateWorkflow: mockUpdateWorkflow,
    isLoading: false,
  })),
}))

import { renderHook, act, waitFor } from '@testing-library/react'
import { useParams, useRouter } from 'next/navigation'
import { useWorkflowState } from '../useWorkflowState'

describe('useWorkflowState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useParams as jest.Mock).mockReturnValue({ workflowId: 'wf-1' })
    ;(useRouter as jest.Mock).mockReturnValue({ push: jest.fn() })
    mockGetWorkflow.mockResolvedValue(null)
  })

  it('should return workflowId from params', () => {
    const { result } = renderHook(() => useWorkflowState())
    expect(result.current.workflowId).toBe('wf-1')
  })

  it('should initialize workflow with default values', () => {
    const { result } = renderHook(() => useWorkflowState())
    expect(result.current.workflow.name).toBe('My Workflow')
    expect(result.current.workflow.nodes).toHaveLength(1)
  })

  it('should set workflow id from params', () => {
    const { result } = renderHook(() => useWorkflowState())
    expect(result.current.workflow.id).toBe('wf-1')
  })

  it('should call getWorkflow on mount when workflowId is not new', async () => {
    renderHook(() => useWorkflowState())
    await waitFor(() => {
      expect(mockGetWorkflow).toHaveBeenCalledWith('wf-1')
    })
  })

  it('should not call getWorkflow when workflowId is new', async () => {
    ;(useParams as jest.Mock).mockReturnValue({ workflowId: 'new' })
    renderHook(() => useWorkflowState())
    await waitFor(() => {
      expect(mockGetWorkflow).not.toHaveBeenCalled()
    })
  })

  it('should not call getWorkflow when workflowId is undefined', async () => {
    ;(useParams as jest.Mock).mockReturnValue({})
    renderHook(() => useWorkflowState())
    await waitFor(() => {
      expect(mockGetWorkflow).not.toHaveBeenCalled()
    })
  })

  it('should update workflow state when getWorkflow returns data', async () => {
    mockGetWorkflow.mockResolvedValue({
      id: 'wf-1',
      name: 'Loaded Workflow',
      description: 'A loaded workflow',
      nodes: [{ id: 'n1' }],
      createdAt: new Date('2024-01-01').getTime(),
      updatedAt: new Date('2024-01-02').getTime(),
    })
    const { result } = renderHook(() => useWorkflowState())
    await waitFor(() => {
      expect(result.current.workflow.name).toBe('Loaded Workflow')
    })
  })

  it('should call updateWorkflow on handleSave for existing workflow', async () => {
    mockUpdateWorkflow.mockResolvedValue({ id: 'wf-1' })
    const { result } = renderHook(() => useWorkflowState())
    await act(async () => {
      await result.current.handleSave()
    })
    expect(mockUpdateWorkflow).toHaveBeenCalledWith('wf-1', expect.any(Object))
  })

  it('should call createWorkflow on handleSave for new workflow', async () => {
    ;(useParams as jest.Mock).mockReturnValue({ workflowId: 'new' })
    const mockPush = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    mockCreateWorkflow.mockResolvedValue({ id: 'wf-new' })
    const { result } = renderHook(() => useWorkflowState())
    await act(async () => {
      await result.current.handleSave()
    })
    expect(mockCreateWorkflow).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/editor/wf-new')
  })

  it('should allow setting workflow via setWorkflow', () => {
    const { result } = renderHook(() => useWorkflowState())
    act(() => {
      result.current.setWorkflow((prev: any) => ({ ...prev, name: 'Updated Name' }))
    })
    expect(result.current.workflow.name).toBe('Updated Name')
  })

  it('should return isSaving from useWorkflows', () => {
    const { result } = renderHook(() => useWorkflowState())
    expect(result.current.isSaving).toBe(false)
  })
})
