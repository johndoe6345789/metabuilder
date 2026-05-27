/**
 * useWorkspacePage - State and handlers for workspace page
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useProject, useWorkspace } from '../../../../hooks';

export function useWorkspacePage() {
  const params = useParams();
  const workspaceId = params?.id as string;

  const { currentWorkspace, switchWorkspace } = useWorkspace();
  const { projects, loadProjects, createProject } = useProject();

  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    if (workspaceId) {
      switchWorkspace(workspaceId);
      loadProjects(workspaceId);
      setIsLoading(false);
    }
  }, [workspaceId]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !workspaceId) return;
    try {
      await createProject({
        name: newProjectName,
        workspaceId,
        description: '',
      });
      setNewProjectName('');
      setShowCreateForm(false);
      loadProjects(workspaceId);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const starredProjects = projects.filter((p) => p.starred);
  const regularProjects = projects.filter((p) => !p.starred);

  return {
    workspaceId,
    currentWorkspace,
    isLoading,
    showCreateForm,
    setShowCreateForm,
    newProjectName,
    setNewProjectName,
    handleCreateProject,
    starredProjects,
    regularProjects,
  };
}
