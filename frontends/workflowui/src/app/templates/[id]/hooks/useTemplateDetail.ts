/**
 * useTemplateDetail - State for the template detail page
 */

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { templateService } from '@metabuilder/services';

export function useTemplateDetail() {
  const params = useParams();
  const templateId = params?.id as string;
  const template = templateService.getTemplate(templateId);
  const relatedTemplates =
    templateService.getRelatedTemplates(templateId);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [projectName, setProjectName] = useState(
    template?.name || ''
  );
  const [workspace, setWorkspace] = useState('');
  const [customizeWorkflows, setCustomizeWorkflows] =
    useState(true);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating project:', projectName);
    setShowCreateForm(false);
  };

  return {
    template,
    relatedTemplates,
    showCreateForm,
    setShowCreateForm,
    projectName,
    setProjectName,
    workspace,
    setWorkspace,
    customizeWorkflows,
    setCustomizeWorkflows,
    handleCreateProject,
  };
}
