/**
 * useEditorComposition - Assembles EditorCanvasArea and EditorPanels props
 */

'use client';

import { DragEvent, RefObject } from 'react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { NodeType } from '@/../../../components/workflow-editor';
import type { Workflow } from '@metabuilder/hooks';
import { useNodeTypes } from '@/../../../hooks/workflow-editor';
import { useCanvasInteraction } from './useCanvasInteraction';
import { useNodeOperations } from './useNodeOperations';
import { useEditorKeyboard } from './useEditorKeyboard';
import { useEditorToolbarActions } from './useEditorToolbarActions';

interface CompositionInput {
  router: AppRouterInstance;
  canvasRef: RefObject<HTMLDivElement>;
  workflow: Workflow;
  setWorkflow: React.Dispatch<React.SetStateAction<Workflow>>;
  handleSave: () => void;
  handleRun: () => void;
}

export function useEditorComposition({
  router, canvasRef, workflow, setWorkflow,
  handleSave, handleRun,
}: CompositionInput) {
  const nodeTypesApi = useNodeTypes({
    autoExpandCategories: false,
  });
  const canvas = useCanvasInteraction(canvasRef);
  const nodes = useNodeOperations({
    workflow, setWorkflow,
    canvasOffset: canvas.canvasOffset,
    zoom: canvas.zoom,
    draggingNodeId: canvas.draggingNodeId,
    setDraggingNodeId: canvas.setDraggingNodeId,
    dragOffset: canvas.dragOffset,
    setDragOffset: canvas.setDragOffset,
    drawingConnection: canvas.drawingConnection,
    setDrawingConnection: canvas.setDrawingConnection,
    canvasRef,
  });

  useEditorKeyboard({
    selectedNodeId: nodes.selectedNodeId,
    setSelectedNodeId: nodes.setSelectedNodeId,
    setDrawingConnection: canvas.setDrawingConnection,
    setPropertiesDialogOpen: nodes.setPropertiesDialogOpen,
    handleDeleteNode: nodes.handleDeleteNode,
  });

  const toolbar = useEditorToolbarActions({
    router, setWorkflow,
    setZoom: canvas.setZoom,
    setCanvasOffset: canvas.setCanvasOffset,
    handleSave, handleRun,
  });

  const getNodeType =
    nodeTypesApi.getNodeType as (t: string) =>
      NodeType | undefined;

  const selectedNodeType = nodes.selectedNode
    ? getNodeType(nodes.selectedNode.type)
    : undefined;

  const handlePaletteDragStart = (
    e: DragEvent, nodeType: NodeType
  ) => {
    e.dataTransfer.setData('nodeType', JSON.stringify(nodeType));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleCanvasDragOver = (
    e: DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  return {
    toolbar, canvas, nodes, nodeTypesApi,
    getNodeType, selectedNodeType,
    handlePaletteDragStart, handleCanvasDragOver,
  };
}
