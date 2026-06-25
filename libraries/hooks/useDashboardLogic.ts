/**
 * useDashboardLogic Hook
 * Business logic for dashboard page including workspace management
 */

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from './useWorkspace';

export interface UseDashboardLogicReturn {
  isLoading: boolean;
  showCreateForm: boolean;
  newWorkspaceName: string;
  workspaces: any[];
  currentWorkspace: any;
  setShowCreateForm: (show: boolean) => void;
  setNewWorkspaceName: (name: string) => void;
  handleCreateWorkspace: (e: React.FormEvent) => Promise<void>;
  handleWorkspaceClick: (workspaceId: string) => void;
  resetWorkspaceForm: () => void;
}

/**
 * Custom hook for dashboard logic
 * Manages workspace creation, switching, and loading states
 */
export const useDashboardLogic = (): UseDashboardLogicReturn => {
  const router = useRouter();
  const {
    workspaces,
    currentWorkspace,
    switchWorkspace,
    createWorkspace,
    loadWorkspaces
  } = useWorkspace();

  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  // Load workspaces once on mount
  useEffect(() => {
    loadWorkspaces().finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetWorkspaceForm = useCallback(() => {
    setShowCreateForm(false);
    setNewWorkspaceName('');
  }, []);

  const handleCreateWorkspace = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!newWorkspaceName.trim()) {
        return;
      }

      try {
        const workspace = await createWorkspace({
          name: newWorkspaceName,
          description: '',
          color: '#1976d2'
        });

        resetWorkspaceForm();
        switchWorkspace(workspace.id);
        router.push(`/workspace/${workspace.id}`);
      } catch (error) {
        console.error('Failed to create workspace:', error);
      }
    },
    [newWorkspaceName, createWorkspace, switchWorkspace, router, resetWorkspaceForm]
  );

  const handleWorkspaceClick = useCallback(
    (workspaceId: string) => {
      switchWorkspace(workspaceId);
      router.push(`/workspace/${workspaceId}`);
    },
    [switchWorkspace, router]
  );

  return {
    isLoading,
    showCreateForm,
    newWorkspaceName,
    workspaces,
    currentWorkspace,
    setShowCreateForm,
    setNewWorkspaceName,
    handleCreateWorkspace,
    handleWorkspaceClick,
    resetWorkspaceForm
  };
};
