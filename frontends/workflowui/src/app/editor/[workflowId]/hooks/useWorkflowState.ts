/**
 * useWorkflowState - Workflow data and CRUD operations
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useWorkflows } from '@metabuilder/hooks';
import type { Workflow } from '@metabuilder/components/workflow-editor';
import {
  defaultWorkflow,
  buildSavePayload,
} from './workflowStateUtils';

export function useWorkflowState() {
  const router = useRouter();
  const params = useParams();
  const workflowId = params?.workflowId as string;
  const {
    getWorkflow,
    createWorkflow,
    updateWorkflow,
    isLoading: isSaving,
  } = useWorkflows();

  const [workflow, setWorkflow] = useState<Workflow>(
    () => defaultWorkflow(workflowId)
  );

  useEffect(() => {
    if (workflowId && workflowId !== 'new') {
      loadWorkflowData();
    }
  }, [workflowId]);

  const loadWorkflowData = async () => {
    if (!workflowId || workflowId === 'new') return;
    const data = await getWorkflow(workflowId);
    if (data) {
      setWorkflow({
        id: data.id,
        name: data.name,
        description: data.description || '',
        nodes: data.nodes || [],
        connections: [],
        createdAt: new Date(data.createdAt).toISOString(),
        updatedAt: new Date(data.updatedAt).toISOString(),
      });
    }
  };

  const handleSave = async () => {
    const payload = buildSavePayload(workflow);
    if (workflowId && workflowId !== 'new') {
      await updateWorkflow(workflowId, payload);
    } else {
      const created = await createWorkflow(payload);
      if (created) router.push(`/editor/${created.id}`);
    }
  };

  const handleRun = async () => {
    if (workflowId && workflowId !== 'new') {
      await handleSave();
    }
    alert(
      `Workflow "${workflow.name}" execution simulated!\n\n` +
      `Nodes: ${workflow.nodes.length}\n` +
      `Connections: ${workflow.connections.length}\n\n` +
      `Full execution engine coming soon!`
    );
  };

  return {
    workflow,
    setWorkflow,
    workflowId,
    isSaving,
    handleSave,
    handleRun,
  };
}
