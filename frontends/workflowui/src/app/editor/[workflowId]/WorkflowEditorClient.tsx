/** Visual Workflow Editor — n8n-style drag and drop builder */

'use client';
import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/../../../scss/atoms/workflow-editor.module.scss';
import {
  type NodeType,
  EditorToolbar,
} from '@/../../../components/workflow-editor';
import { useWorkflowState } from './hooks/useWorkflowState';
import { useEditorComposition } from './hooks/useEditorComposition';
import EditorCanvasArea from './EditorCanvasArea';
import EditorPanels from './EditorPanels';

type CatMap = Record<
  string, { id: string; name: string; color: string }
>;

export default function WorkflowEditorClient() {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);

  const { workflow, setWorkflow, handleSave, handleRun } =
    useWorkflowState();

  const {
    toolbar, canvas, nodes, nodeTypesApi,
    getNodeType, selectedNodeType,
    handlePaletteDragStart, handleCanvasDragOver,
  } = useEditorComposition({
    router, canvasRef, workflow, setWorkflow,
    handleSave, handleRun,
  });

  const panelsProps = {
    nodeSearch: nodeTypesApi.searchQuery,
    onSearchChange: nodeTypesApi.setSearchQuery,
    expandedCategories: nodeTypesApi.expandedCategories,
    onToggleCategory: nodeTypesApi.toggleCategory,
    onExpandAll: nodeTypesApi.expandAllCategories,
    onCollapseAll: nodeTypesApi.collapseAllCategories,
    onDragStart: handlePaletteDragStart,
    nodeTypes: nodeTypesApi.filteredNodeTypes as NodeType[],
    categories: nodeTypesApi.categories as CatMap,
    languages: nodeTypesApi.languages,
    languageHealth: nodeTypesApi.languageHealth,
    selectedLanguage: nodeTypesApi.selectedLanguage,
    onLanguageChange: nodeTypesApi.setSelectedLanguage,
    isLoading: nodeTypesApi.isLoading,
    propertiesDialogOpen: nodes.propertiesDialogOpen,
    onPropertiesClose: () => nodes.setPropertiesDialogOpen(false),
    selectedNode: nodes.selectedNode, selectedNodeType,
    onUpdateConfig: nodes.handleUpdateConfig,
    onUpdateName: nodes.handleUpdateName,
    onDeleteNode: nodes.handleDeleteNode,
  };

  return (
    <div className={styles.editor}>
      <EditorToolbar
        workflowName={workflow.name}
        onNameChange={toolbar.onNameChange}
        nodeCount={workflow.nodes.length}
        connectionCount={workflow.connections.length}
        zoom={canvas.zoom}
        onZoomIn={toolbar.onZoomIn}
        onZoomOut={toolbar.onZoomOut}
        onZoomReset={toolbar.onZoomReset}
        onBack={toolbar.onBack}
        onSave={toolbar.onSave}
        onRun={toolbar.onRun}
        languageHealth={nodeTypesApi.languageHealth}
      />
      <div className={styles.content}>
        <EditorCanvasArea
          canvasRef={canvasRef}
          canvasOffset={canvas.canvasOffset}
          zoom={canvas.zoom}
          isPanning={canvas.isPanning}
          nodes={workflow.nodes}
          connections={workflow.connections}
          drawingConnection={canvas.drawingConnection}
          selectedNodeId={nodes.selectedNodeId}
          onCanvasDrop={nodes.handleCanvasDrop}
          onCanvasDragOver={handleCanvasDragOver}
          onCanvasMouseDown={canvas.handleCanvasMouseDown}
          onWheel={canvas.handleWheel}
          onNodeSelect={nodes.handleNodeSelect}
          onNodeDoubleClick={nodes.handleNodeDoubleClick}
          onNodeDragStart={nodes.handleNodeDragStart}
          onConnectionStart={nodes.handleConnectionStart}
          onConnectionEnd={nodes.handleConnectionEnd}
          getNodeType={getNodeType}
        />
        <EditorPanels {...panelsProps} />
      </div>
    </div>
  );
}
