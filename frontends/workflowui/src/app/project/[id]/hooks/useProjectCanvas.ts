/** useProjectCanvas - Project canvas state and handlers */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  useProject,
  useUI,
  useProjectWorkflows,
} from '@metabuilder/hooks';
import {
  formatDate,
  getStatusColor,
  getStatusBorderColor,
} from './canvasUtils';

export function useProjectCanvasPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;
  const { currentProject } = useProject();
  const { success, error } = useUI();
  const {
    workflows,
    isLoading: workflowsLoading,
    error: workflowsError,
  } = useProjectWorkflows({ projectId, autoLoad: true });

  const [selectedCard, setSelectedCard] = useState<
    string | null
  >(null);
  const [draggedCard, setDraggedCard] = useState<
    string | null
  >(null);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [canvasPan, setCanvasPan] = useState(
    { x: 0, y: 0 }
  );

  useEffect(() => {
    if (workflowsError) error(workflowsError);
  }, [workflowsError, error]);

  const handleCardClick = (workflowId: string) => {
    setSelectedCard(workflowId);
    router.push(`/editor/${workflowId}` as any);
  };

  const handleCardDragStart = (
    e: React.DragEvent,
    workflowId: string
  ) => {
    setDraggedCard(workflowId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedCard) {
      success('Workflow repositioned');
      setDraggedCard(null);
    }
  };

  return {
    projectId,
    currentProject,
    workflows,
    workflowsLoading,
    selectedCard,
    canvasZoom,
    setCanvasZoom,
    canvasPan,
    setCanvasPan,
    handleCardClick,
    handleCardDragStart,
    handleCanvasDragOver,
    handleCanvasDrop,
    formatDate,
    getStatusColor,
    getStatusBorderColor,
    success,
  };
}
