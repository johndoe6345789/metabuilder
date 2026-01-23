/**
 * useProject Hook
 * Manages project state and operations
 */

import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import {
  setProjects,
  addProject,
  updateProject,
  removeProject,
  setCurrentProject,
  setLoading,
  setError,
  selectProjects,
  selectCurrentProject,
  selectCurrentProjectId,
  selectProjectIsLoading,
  selectProjectError
} from '../store/slices/projectSlice';
import projectService from '../services/projectService';
import { projectDB } from '../db/schema';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '../types/project';

/**
 * useProject Hook
 * Manages project state and operations
 *
 * TODO: Notifications pending Phase 3
 * showNotification calls have been removed. When Phase 3 introduces the notification system,
 * uncomment the notification calls at lines that previously had them.
 */
export function useProject() {
  const dispatch = useDispatch<AppDispatch>();
  const [isInitialized, setIsInitialized] = useState(false);

  // Selectors
  const projects = useSelector((state: RootState) => selectProjects(state));
  const currentProject = useSelector((state: RootState) => selectCurrentProject(state));
  const currentProjectId = useSelector((state: RootState) => selectCurrentProjectId(state));
  const isLoading = useSelector((state: RootState) => selectProjectIsLoading(state));
  const error = useSelector((state: RootState) => selectProjectError(state));

  // Get tenant ID from localStorage or default
  const getTenantId = useCallback(() => {
    return localStorage.getItem('tenantId') || 'default';
  }, []);

  // Load projects for specific workspace
  const loadProjects = useCallback(
    async (workspaceId: string) => {
      dispatch(setLoading(true));
      try {
        const tenantId = getTenantId();
        const response = await projectService.listProjects(tenantId, workspaceId);
        dispatch(setProjects(response.projects));

        // Cache in IndexedDB
        await Promise.all(response.projects.map((p) => projectDB.update(p)));

        dispatch(setError(null));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load projects';
        dispatch(setError(errorMsg));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, getTenantId]
  );

  // Create project
  const createProject = useCallback(
    async (data: CreateProjectRequest) => {
      dispatch(setLoading(true));
      try {
        const tenantId = getTenantId();
        const project = await projectService.createProject({
          ...data,
          tenantId
        });

        dispatch(addProject(project));
        await projectDB.create(project);

        return project;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create project';
        dispatch(setError(errorMsg));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, getTenantId]
  );

  // Update project
  const updateProjectData = useCallback(
    async (id: string, data: UpdateProjectRequest) => {
      dispatch(setLoading(true));
      try {
        const updated = await projectService.updateProject(id, data);
        dispatch(updateProject(updated));
        await projectDB.update(updated);

        return updated;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update project';
        dispatch(setError(errorMsg));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  // Delete project
  const deleteProject = useCallback(
    async (id: string) => {
      dispatch(setLoading(true));
      try {
        await projectService.deleteProject(id);
        dispatch(removeProject(id));
        await projectDB.delete(id);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to delete project';
        dispatch(setError(errorMsg));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  // Switch project
  const switchProject = useCallback(
    (id: string | null) => {
      dispatch(setCurrentProject(id));
      if (id) {
        localStorage.setItem('currentProjectId', id);
      } else {
        localStorage.removeItem('currentProjectId');
      }
    },
    [dispatch]
  );

  return {
    // State
    projects,
    currentProject,
    currentProjectId,
    isLoading,
    error,

    // Actions
    loadProjects,
    createProject,
    updateProject: updateProjectData,
    deleteProject,
    switchProject
  };
}

export default useProject;
