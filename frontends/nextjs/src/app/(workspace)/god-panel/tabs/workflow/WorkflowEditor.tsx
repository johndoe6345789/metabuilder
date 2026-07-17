'use client'

import {
  CanvasNode,
  ConnectionLine,
  EditorToolbar,
  NodePalette,
  PropertiesDialog,
  NODE_CATEGORIES,
  NODE_TYPES,
  type NodeType,
  type Workflow,
} from '@/workflow-editor'
import { useWorkflowEditor } from './use-workflow-editor'
import { useNodePalette } from './use-node-palette'
import s from './WorkflowEditor.module.scss'

interface Props {
  workflow: Workflow
  onChange: (wf: Workflow) => void
  onSave?: (wf: Workflow) => void
  onRun?: (wf: Workflow) => void
  onBack?: () => void
}

export function WorkflowEditor({
  workflow,
  onChange,
  onSave,
  onRun,
  onBack,
}: Props) {
  const ed = useWorkflowEditor(workflow, onChange)
  const pal = useNodePalette()

  const q = pal.search.toLowerCase()
  const filtered: NodeType[] = q
    ? NODE_TYPES.filter(
        n =>
          n.name.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q)
      )
    : NODE_TYPES

  return (
    <div className={s.editor}>
      <EditorToolbar
        workflowName={ed.workflow.name}
        onNameChange={ed.setName}
        nodeCount={ed.workflow.nodes.length}
        connectionCount={ed.workflow.connections.length}
        zoom={ed.zoom}
        onZoomIn={ed.zoomIn}
        onZoomOut={ed.zoomOut}
        onZoomReset={ed.zoomReset}
        onBack={() => onBack?.()}
        onSave={() => onSave?.(ed.workflow)}
        onRun={() => onRun?.(ed.workflow)}
      />

      <div className={s.content}>
        <div
          ref={ed.canvasRef}
          data-canvas="1"
          className={s.canvas}
          style={{
            backgroundSize: `${20 * ed.zoom}px ${20 * ed.zoom}px`,
            backgroundPosition: `${ed.canvasOffset.x}px ${ed.canvasOffset.y}px`,
            cursor: ed.isPanning ? 'grabbing' : 'default',
          }}
          onMouseDown={ed.onCanvasMouseDown}
          onWheel={ed.onWheel}
          onDrop={ed.onCanvasDrop}
          onDragOver={ed.onCanvasDragOver}
        >
          <div
            className={s.transform}
            style={{
              transform: `translate(${ed.canvasOffset.x}px, ${ed.canvasOffset.y}px) scale(${ed.zoom})`,
            }}
          >
            {ed.workflow.connections.map(c => (
              <ConnectionLine
                key={c.id}
                connection={c}
                nodes={ed.workflow.nodes}
              />
            ))}
            {ed.workflow.nodes.map(node => (
              <CanvasNode
                key={node.id}
                node={node}
                nodeType={ed.getNodeType(node.type)}
                isSelected={ed.selectedNodeId === node.id}
                onSelect={ed.selectNode}
                onDoubleClick={ed.openProps}
                onDragStart={ed.onNodeDragStart}
                onConnectionStart={ed.onConnectionStart}
                onConnectionEnd={ed.onConnectionEnd}
                isDrawingConnection={ed.drawing !== null}
              />
            ))}
          </div>
          {ed.workflow.nodes.length === 0 && (
            <div className={s.empty}>
              Drag a node from the palette to start →
            </div>
          )}
        </div>

        <NodePalette
          nodeSearch={pal.search}
          onSearchChange={pal.setSearch}
          expandedCategories={pal.expanded}
          onToggleCategory={pal.toggle}
          onExpandAll={pal.expandAll}
          onCollapseAll={pal.collapseAll}
          onDragStart={ed.onPaletteDragStart}
          nodeTypes={filtered}
          categories={NODE_CATEGORIES}
        />
      </div>

      <PropertiesDialog
        open={ed.propertiesOpen}
        onClose={() => ed.setPropertiesOpen(false)}
        node={ed.selectedNode}
        nodeType={
          ed.selectedNode ? ed.getNodeType(ed.selectedNode.type) : undefined
        }
        onUpdateConfig={ed.updateConfig}
        onUpdateName={ed.updateName}
        onDelete={ed.deleteNode}
      />
    </div>
  )
}
