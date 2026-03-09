/**
 * useProject Hook (Tier 2)
 * Manages project state and operations with service adapter injection
 *
 * Features:
 * - Load projects from service adapter
 * - Create, update, delete projects
 * - Switch between projects
 * - Redux integration for state management
 * - Service-independent (HTTP, GraphQL, or mock implementations)
 */

import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useServices } from '@metabuilder/service-adapters'
import {
  setProjects,
  addProject,
  updateProject,
  removeProject,
  setCurrentProject,
  setProjectLoading,
  setProjectError,
  selectProjects,
  selectCurrentProject,
  selectCurrentProjectId,
  selectProjectIsLoading,
  selectProjectError,
} from '@metabuilder/redux-slices'
import type { Project, CreateProjectRequest, UpdateProjectRequest } from '@metabuilder/types'
import type { AppDispatch, RootState } from '@metabuilder/redux-slices'

/**
 * useProject Hook
 * Manages project operations with service adapter injection
 *
 * @example
 * const { projects, createProject, loadProjects } = useProject();
 * await loadProjects('workspace-123');
 * const newProject = await createProject({ name: 'My Project', workspaceId: 'ws-1' });
 */
export function useProject() {
  const dispatch = useDispatch<AppDispatch>()
  const { projectService } = useServices()
  const [isInitialized, setIsInitialized] = useState(false)

  // Selectors
  const projects = useSelector((state: RootState) => selectProjects(state))
  const currentProject = useSelector((state: RootState) => selectCurrentProject(state))
  const currentProjectId = useSelector((state: RootState) => selectCurrentProjectId(state))
  const isLoading = useSelector((state: RootState) => selectProjectIsLoading(state))
  const error = useSelector((state: RootState) => selectProjectError(state))

  // Get tenant ID from localStorage
  const getTenantId = useCallback(() => {
    return localStorage.getItem('tenantId') || 'default'
  }, [])

  /**
   * Load projects for specific workspace
   */
  const loadProjects = useCallback(
    async (workspaceId: string) => {
      dispatch(setProjectLoading(true))
      try {
        const tenantId = getTenantId()
        const projectList = await projectService.listProjects(tenantId, workspaceId)
        dispatch(setProjects(projectList))
        dispatch(setProjectError(null))
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load projects'
        dispatch(setProjectError(errorMsg))
        throw err
      } finally {
        dispatch(setProjectLoading(false))
      }
    },
    [dispatch, getTenantId, projectService]
  )

  /**
   * Create new project
   */
  const createProject = useCallback(
    async (data: CreateProjectRequest) => {
      dispatch(setProjectLoading(true))
      try {
        const tenantId = getTenantId()
        const project = await projectService.createProject({
          ...data,
          tenantId,
        })
        dispatch(addProject(project))
        return project
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create project'
        dispatch(setProjectError(errorMsg))
        throw err
      } finally {
        dispatch(setProjectLoading(false))
      }
    },
    [dispatch, getTenantId, projectService]
  )

  /**
   * Update existing project
   */
  const updateProjectData = useCallback(
    async (id: string, data: UpdateProjectRequest) => {
      dispatch(setProjectLoading(true))
      try {
        const updated = await projectService.updateProject(id, data)
        dispatch(updateProject(updated))
        return updated
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update project'
        dispatch(setProjectError(errorMsg))
        throw err
      } finally {
        dispatch(setProjectLoading(false))
      }
    },
    [dispatch, projectService]
  )

  /**
   * Delete project
   */
  const deleteProject = useCallback(
    async (id: string) => {
      dispatch(setProjectLoading(true))
      try {
        await projectService.deleteProject(id)
        dispatch(removeProject(id))
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to delete project'
        dispatch(setProjectError(errorMsg))
        throw err
      } finally {
        dispatch(setProjectLoading(false))
      }
    },
    [dispatch, projectService]
  )

  /**
   * Switch to different project
   */
  const switchProject = useCallback(
    (id: string | null) => {
      dispatch(setCurrentProject(id))
      if (id) {
        localStorage.setItem('currentProjectId', id)
      } else {
        localStorage.removeItem('currentProjectId')
      }
    },
    [dispatch]
  )

  return {
    // State
    projects,
    currentProject,
    currentProjectId,
    isLoading,
    error,
    isInitialized,

    // Actions
    loadProjects,
    createProject,
    updateProject: updateProjectData,
    deleteProject,
    switchProject,
  }
}

export default useProject
