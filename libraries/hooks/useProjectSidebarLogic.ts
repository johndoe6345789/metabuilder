/**
 * useProjectSidebarLogic Hook
 * Business logic for project sidebar including project operations
 */

import { useState, useCallback, useMemo } from 'react';
import type { Project } from '@metabuilder/types';

export interface UseProjectSidebarLogicReturn {
  isCollapsed: boolean;
  showNewProjectForm: boolean;
  newProjectName: string;
  starredProjects: Project[];
  regularProjects: Project[];
  setIsCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  setShowNewProjectForm: (show: boolean) => void;
  setNewProjectName: (name: string) => void;
  handleCreateProject: (e: React.FormEvent, onSuccess: () => void) => Promise<void>;
  handleProjectClick: (projectId: string, onSelect: (id: string) => void) => void;
  resetProjectForm: () => void;
}

/**
 * Custom hook for project sidebar logic
 * Manages project filtering, form state, and project operations
 */
export const useProjectSidebarLogic = (projects: Project[]): UseProjectSidebarLogicReturn => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Memoized project filtering
  const starredProjects = useMemo(
    () => projects.filter((p) => p.starred),
    [projects]
  );

  const regularProjects = useMemo(
    () => projects.filter((p) => !p.starred),
    [projects]
  );

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const resetProjectForm = useCallback(() => {
    setShowNewProjectForm(false);
    setNewProjectName('');
  }, []);

  const handleCreateProject = useCallback(
    async (e: React.FormEvent, onSuccess: () => void) => {
      e.preventDefault();

      if (!newProjectName.trim()) {
        return;
      }

      try {
        // This would call the createProject from useProject hook
        // Caller should handle the actual API call
        await onSuccess?.();
        resetProjectForm();
      } catch (error) {
        console.error('Failed to create project:', error);
      }
    },
    [newProjectName, resetProjectForm]
  );

  const handleProjectClick = useCallback(
    (projectId: string, onSelect: (id: string) => void) => {
      onSelect(projectId);
    },
    []
  );

  return {
    isCollapsed,
    showNewProjectForm,
    newProjectName,
    starredProjects,
    regularProjects,
    setIsCollapsed,
    toggleCollapsed,
    setShowNewProjectForm,
    setNewProjectName,
    handleCreateProject,
    handleProjectClick,
    resetProjectForm
  };
};
