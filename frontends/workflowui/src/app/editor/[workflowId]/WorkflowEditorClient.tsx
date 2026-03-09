/**
 * Visual Workflow Editor Page
 * n8n-style drag and drop workflow builder with M3 styling
 * Dynamically loads plugins from /api/plugins
 */

'use client';

import React, { useState, useCallback, useRef, useEffect, DragEvent, MouseEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getBezierPath, Position as EdgePosition } from '@/lib/flow';
import styles from '@/../../../scss/atoms/workflow-editor.module.scss';

import {
  type Position,
  type NodeType,
  type WorkflowNode,
  type Connection,
  type Workflow,
  generateNodeId,
  generateConnectionId,
  CanvasNode,
  ConnectionLine,
  NodePalette,
  PropertiesDialog,
  EditorToolbar,
} from '@/../../../components/workflow-editor';
import { useNodeTypes } from '@/../../../hooks/workflow-editor';
import { useWorkflows } from '@metabuilder/hooks';

export default function WorkflowEditorClient() {
  const router = useRouter();
  const params = useParams();
  const workflowId = params?.workflowId as string;
  const canvasRef = useRef<HTMLDivElement>(null);

  // DBAL workflow operations
  const { getWorkflow, createWorkflow, updateWorkflow, isLoading: isSaving } = useWorkflows();

  // Dynamic node types from API
  const {
    nodeTypes,
    categories,
    languages,
    languageHealth,
    selectedLanguage,
    setSelectedLanguage,
    searchQuery: nodeSearch,
    setSearchQuery: setNodeSearch,
    filteredNodeTypes,
    expandedCategories,
    toggleCategory,
    expandAllCategories,
    collapseAllCategories,
    getNodeType,
    isLoading: isLoadingNodes,
  } = useNodeTypes({ autoExpandCategories: false });

  // Workflow state
  const [workflow, setWorkflow] = useState<Workflow>(() => ({
    id: workflowId || 'new',
    name: 'My Workflow',
    description: '',
    nodes: [
      {
        id: 'node_1',
        type: 'trigger.manual',
        name: 'Start',
        position: { x: 100, y: 200 },
        config: {},
        inputs: [],
        outputs: ['main'],
      },
    ],
    connections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  // UI state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [propertiesDialogOpen, setPropertiesDialogOpen] = useState(false);

  // Canvas transform state
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Dragging state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Connection drawing state
  const [drawingConnection, setDrawingConnection] = useState<{
    sourceNodeId: string;
    sourceOutput: string;
    startPosition: Position;
    currentPosition: Position;
  } | null>(null);

  // Get selected node and its type
  const selectedNode = workflow.nodes.find(n => n.id === selectedNodeId) || null;
  const selectedNodeType = selectedNode ? getNodeType(selectedNode.type) as NodeType | undefined : undefined;

  // Palette drag handlers
  const handlePaletteDragStart = (e: DragEvent, nodeType: NodeType) => {
    e.dataTransfer.setData('nodeType', JSON.stringify(nodeType));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleCanvasDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('nodeType');
    if (!data) return;

    const nodeType: NodeType = JSON.parse(data);
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const x = (e.clientX - canvasRect.left - canvasOffset.x) / zoom;
    const y = (e.clientY - canvasRect.top - canvasOffset.y) / zoom;

    const newNode: WorkflowNode = {
      id: generateNodeId(),
      type: nodeType.id,
      name: nodeType.name,
      position: { x, y },
      config: { ...nodeType.defaultConfig },
      inputs: [...nodeType.inputs],
      outputs: [...nodeType.outputs],
    };

    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      updatedAt: new Date().toISOString(),
    }));
    setSelectedNodeId(newNode.id);
  };

  const handleCanvasDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Node interaction handlers
  const handleNodeSelect = (nodeId: string) => setSelectedNodeId(nodeId);
  const handleNodeDoubleClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setPropertiesDialogOpen(true);
  };

  const handleNodeDragStart = (e: MouseEvent, nodeId: string) => {
    const node = workflow.nodes.find(n => n.id === nodeId);
    if (!node) return;
    setDraggingNodeId(nodeId);
    setDragOffset({
      x: e.clientX - node.position.x * zoom - canvasOffset.x,
      y: e.clientY - node.position.y * zoom - canvasOffset.y,
    });
  };

  // Mouse move handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggingNodeId) {
      const newX = (e.clientX - dragOffset.x - canvasOffset.x) / zoom;
      const newY = (e.clientY - dragOffset.y - canvasOffset.y) / zoom;
      setWorkflow(prev => ({
        ...prev,
        nodes: prev.nodes.map(n =>
          n.id === draggingNodeId ? { ...n, position: { x: newX, y: newY } } : n
        ),
      }));
    }
    if (drawingConnection) {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      setDrawingConnection(prev => prev ? {
        ...prev,
        currentPosition: {
          x: (e.clientX - canvasRect.left - canvasOffset.x) / zoom,
          y: (e.clientY - canvasRect.top - canvasOffset.y) / zoom,
        },
      } : null);
    }
    if (isPanning) {
      setCanvasOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  }, [draggingNodeId, drawingConnection, isPanning, dragOffset, canvasOffset, zoom, panStart]);

  const handleMouseUp = useCallback(() => {
    if (draggingNodeId) setDraggingNodeId(null);
    if (drawingConnection) setDrawingConnection(null);
    if (isPanning) setIsPanning(false);
  }, [draggingNodeId, drawingConnection, isPanning]);

  // Connection handlers
  const handleConnectionStart = (nodeId: string, outputName: string, position: Position) => {
    setDrawingConnection({ sourceNodeId: nodeId, sourceOutput: outputName, startPosition: position, currentPosition: position });
  };

  const handleConnectionEnd = (targetNodeId: string, targetInput: string) => {
    if (!drawingConnection || drawingConnection.sourceNodeId === targetNodeId) {
      setDrawingConnection(null);
      return;
    }
    const isDuplicate = workflow.connections.some(
      c => c.sourceNodeId === drawingConnection.sourceNodeId &&
           c.sourceOutput === drawingConnection.sourceOutput &&
           c.targetNodeId === targetNodeId && c.targetInput === targetInput
    );
    if (isDuplicate) { setDrawingConnection(null); return; }

    setWorkflow(prev => ({
      ...prev,
      connections: [...prev.connections, {
        id: generateConnectionId(),
        sourceNodeId: drawingConnection.sourceNodeId,
        sourceOutput: drawingConnection.sourceOutput,
        targetNodeId,
        targetInput,
      }],
      updatedAt: new Date().toISOString(),
    }));
    setDrawingConnection(null);
  };

  // Canvas interaction handlers
  const handleCanvasMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'svg') {
      setSelectedNodeId(null);
      setIsPanning(true);
      setPanStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.min(2, Math.max(0.25, prev + delta)));
  };

  // Node update handlers
  const handleUpdateConfig = (nodeId: string, config: Record<string, unknown>) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === nodeId ? { ...n, config } : n),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleUpdateName = (nodeId: string, name: string) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === nodeId ? { ...n, name } : n),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleDeleteNode = (nodeId: string) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      connections: prev.connections.filter(c => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId),
      updatedAt: new Date().toISOString(),
    }));
    setSelectedNodeId(null);
  };

  // Load workflow on mount if editing existing workflow
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
        connections: [], // TODO: Convert from DBAL connections format
        createdAt: new Date(data.createdAt).toISOString(),
        updatedAt: new Date(data.updatedAt).toISOString(),
      });
    }
  };

  // Toolbar handlers
  const handleSave = async () => {
    try {
      const workflowData = {
        name: workflow.name,
        description: workflow.description,
        version: '1.0.0',
        category: 'custom',
        status: 'draft' as const,
        nodes: workflow.nodes,
        connections: {}, // TODO: Convert workflow.connections to DBAL format
        metadata: {},
      };

      if (workflowId && workflowId !== 'new') {
        // Update existing workflow
        await updateWorkflow(workflowId, workflowData);
      } else {
        // Create new workflow
        const created = await createWorkflow(workflowData);
        if (created) {
          router.push(`/editor/${created.id}`);
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      // Error notification is handled by useWorkflows hook
    }
  };

  const handleRun = async () => {
    try {
      // Save workflow first if it has changes
      if (workflowId && workflowId !== 'new') {
        await handleSave();
      }

      // For now, just show execution simulation
      // TODO: Implement actual workflow execution engine integration
      const executionData = {
        workflowId: workflow.id,
        workflowName: workflow.name,
        nodeCount: workflow.nodes.length,
        startedAt: new Date().toISOString(),
        status: 'simulated',
      };

      console.log('Simulating workflow execution:', executionData);
      alert(
        `Workflow "${workflow.name}" execution simulated!\n\n` +
        `Nodes: ${workflow.nodes.length}\n` +
        `Connections: ${workflow.connections.length}\n\n` +
        `Full execution engine coming soon!`
      );
    } catch (error) {
      console.error('Run error:', error);
      alert('Error running workflow: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Global mouse event listeners
  useEffect(() => {
    const handleGlobalMouseMove = (e: globalThis.MouseEvent) => handleMouseMove(e as unknown as MouseEvent);
    const handleGlobalMouseUp = () => handleMouseUp();

    if (draggingNodeId || drawingConnection || isPanning) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggingNodeId, drawingConnection, isPanning, handleMouseMove, handleMouseUp]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId && document.activeElement?.tagName !== 'INPUT') {
        handleDeleteNode(selectedNodeId);
      }
      if (e.key === 'Escape') {
        setSelectedNodeId(null);
        setDrawingConnection(null);
        setPropertiesDialogOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId]);

  return (
    <div className={styles.editor}>
      <EditorToolbar
        workflowName={workflow.name}
        onNameChange={(name) => setWorkflow(prev => ({ ...prev, name }))}
        nodeCount={workflow.nodes.length}
        connectionCount={workflow.connections.length}
        zoom={zoom}
        onZoomIn={() => setZoom(prev => Math.min(2, prev + 0.25))}
        onZoomOut={() => setZoom(prev => Math.max(0.25, prev - 0.25))}
        onZoomReset={() => { setZoom(1); setCanvasOffset({ x: 0, y: 0 }); }}
        onBack={() => router.back()}
        onSave={handleSave}
        onRun={handleRun}
        languageHealth={languageHealth}
      />

      <div className={styles.content}>
        <div
          ref={canvasRef}
          onDrop={handleCanvasDrop}
          onDragOver={handleCanvasDragOver}
          onMouseDown={handleCanvasMouseDown}
          onWheel={handleWheel}
          className={styles.canvasContainer}
          style={{
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px`,
            cursor: isPanning ? 'grabbing' : 'default',
          }}
        >
          <div
            className={styles.canvasTransform}
            style={{ transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom})` }}
          >
            <svg width="5000" height="5000" className={styles.canvasSvg}>
              {workflow.connections.map(connection => (
                <ConnectionLine key={connection.id} connection={connection} nodes={workflow.nodes} />
              ))}
              {drawingConnection && (() => {
                const [path] = getBezierPath({
                  sourceX: drawingConnection.startPosition.x,
                  sourceY: drawingConnection.startPosition.y,
                  sourcePosition: EdgePosition.Right,
                  targetX: drawingConnection.currentPosition.x,
                  targetY: drawingConnection.currentPosition.y,
                  targetPosition: EdgePosition.Left,
                  curvature: 0.25,
                });
                return <path d={path} fill="none" stroke="var(--mat-sys-primary)" strokeWidth={2} strokeDasharray="5,5" strokeLinecap="round" />;
              })()}
            </svg>

            {workflow.nodes.map(node => (
              <CanvasNode
                key={node.id}
                node={node}
                nodeType={getNodeType(node.type) as NodeType | undefined}
                isSelected={selectedNodeId === node.id}
                onSelect={handleNodeSelect}
                onDoubleClick={handleNodeDoubleClick}
                onDragStart={handleNodeDragStart}
                onConnectionStart={handleConnectionStart}
                onConnectionEnd={handleConnectionEnd}
                isDrawingConnection={drawingConnection !== null}
              />
            ))}
          </div>

          {workflow.nodes.length === 0 && (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyStateTitle}>Drop nodes here to start</h3>
              <p className={styles.emptyStateText}>Drag nodes from the palette on the right</p>
            </div>
          )}
        </div>

        <NodePalette
          nodeSearch={nodeSearch}
          onSearchChange={setNodeSearch}
          expandedCategories={expandedCategories}
          onToggleCategory={toggleCategory}
          onExpandAll={expandAllCategories}
          onCollapseAll={collapseAllCategories}
          onDragStart={handlePaletteDragStart}
          nodeTypes={filteredNodeTypes as NodeType[]}
          categories={categories as Record<string, { id: string; name: string; color: string }>}
          languages={languages}
          languageHealth={languageHealth}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          isLoading={isLoadingNodes}
        />
      </div>

      <PropertiesDialog
        open={propertiesDialogOpen}
        onClose={() => setPropertiesDialogOpen(false)}
        node={selectedNode}
        nodeType={selectedNodeType}
        onUpdateConfig={handleUpdateConfig}
        onUpdateName={handleUpdateName}
        onDelete={handleDeleteNode}
      />
    </div>
  );
}
