/**
 * useProject Hook
 * Manages project state and operations
 *
 * Self-contained hook that uses Redux store internally
 */

import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setProjects,
  addProject as addProjectAction,
  updateProject as updateProjectAction,
  removeProject,
  setCurrentProject,
  setProjectLoading,
  setProjectError,
} from '@metabuilder/redux-slices';
import type { Project } from '@metabuilder/types';

// Re-export Project type for consumers
export type { Project } from '@metabuilder/types';

/** Create project request */
export interface CreateProjectRequest {
  name: string;
  description?: string;
  workspaceId: string;
  tenantId?: string;
  color?: string;
  [key: string]: any;
}

/** Update project request */
export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  starred?: boolean;
  [key: string]: any;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  currentProjectId: string | null;
  isLoading: boolean;
  error: string | null;
}

interface RootState {
  project: ProjectState;
}

/**
 * Self-contained project hook with Redux integration
 */
export function useProject() {
  const dispatch = useDispatch();

  // Redux state selectors
  const projects = useSelector((state: RootState) => state.project?.projects ?? []);
  const currentProject = useSelector((state: RootState) => state.project?.currentProject ?? null);
  const currentProjectId = useSelector((state: RootState) => state.project?.currentProjectId ?? null);
  const isLoading = useSelector((state: RootState) => state.project?.isLoading ?? false);
  const error = useSelector((state: RootState) => state.project?.error ?? null);

  const [isInitialized, setIsInitialized] = useState(false);

  const getTenantId = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tenantId') || 'default';
    }
    return 'default';
  }, []);

  // Load projects for a workspace - returns mock data for now
  const loadProjects = useCallback(
    async (workspaceId: string) => {
      dispatch(setProjectLoading(true));
      try {
        // Mock project data for development
        const mockProjects: Project[] = [
          {
            id: 'proj-1',
            name: 'Data Pipeline',
            description: 'ETL workflow for data processing',
            workspaceId,
            tenantId: getTenantId(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            starred: true,
            color: '#4caf50',
          },
          {
            id: 'proj-2',
            name: 'API Integration',
            description: 'Connect to external APIs',
            workspaceId,
            tenantId: getTenantId(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            starred: false,
            color: '#ff9800',
          },
        ];

        // Filter by workspaceId
        const filtered = mockProjects.filter((p) => p.workspaceId === workspaceId);
        dispatch(setProjects(filtered));
        dispatch(setProjectError(null));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load projects';
        dispatch(setProjectError(errorMsg));
      } finally {
        dispatch(setProjectLoading(false));
      }
    },
    [dispatch, getTenantId]
  );

  // Create project
  const createProject = useCallback(
    async (data: CreateProjectRequest): Promise<Project> => {
      dispatch(setProjectLoading(true));
      try {
        const tenantId = getTenantId();
        const project: Project = {
          id: `proj-${Date.now()}`,
          name: data.name,
          description: data.description || '',
          workspaceId: data.workspaceId,
          tenantId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          starred: false,
          color: data.color || '#1976d2',
        };

        dispatch(addProjectAction(project));
        return project;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create project';
        dispatch(setProjectError(errorMsg));
        throw err;
      } finally {
        dispatch(setProjectLoading(false));
      }
    },
    [dispatch, getTenantId]
  );

  // Update project
  const updateProjectData = useCallback(
    async (id: string, data: UpdateProjectRequest): Promise<Project> => {
      dispatch(setProjectLoading(true));
      try {
        const existing = projects.find((p) => p.id === id);
        if (!existing) throw new Error('Project not found');

        const updated: Project = {
          ...existing,
          ...data,
          updatedAt: Date.now(),
        };

        dispatch(updateProjectAction(updated));
        return updated;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update project';
        dispatch(setProjectError(errorMsg));
        throw err;
      } finally {
        dispatch(setProjectLoading(false));
      }
    },
    [dispatch, projects]
  );

  // Delete project
  const deleteProject = useCallback(
    async (id: string) => {
      dispatch(setProjectLoading(true));
      try {
        dispatch(removeProject(id));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to delete project';
        dispatch(setProjectError(errorMsg));
        throw err;
      } finally {
        dispatch(setProjectLoading(false));
      }
    },
    [dispatch]
  );

  // Switch project
  const switchProject = useCallback(
    (id: string | null) => {
      dispatch(setCurrentProject(id));
      if (typeof window !== 'undefined') {
        if (id) {
          localStorage.setItem('currentProjectId', id);
        } else {
          localStorage.removeItem('currentProjectId');
        }
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
    isInitialized,
    setIsInitialized,

    // Actions
    loadProjects,
    createProject,
    updateProject: updateProjectData,
    deleteProject,
    switchProject,
  };
}

export default useProject;
