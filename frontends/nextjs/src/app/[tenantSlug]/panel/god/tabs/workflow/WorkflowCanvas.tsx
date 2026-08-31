'use client'

import { CanvasNode, ConnectionLine } from '@/workflow-editor'
import type { useWorkflowEditor } from './use-workflow-editor'
import s from './WorkflowEditor.module.scss'

export interface WorkflowCanvasProps {
  ed: ReturnType<typeof useWorkflowEditor>
}

/** The pannable/zoomable node graph -- drag surface, connection lines, and
 *  nodes -- kept out of WorkflowEditor so that file only owns page layout. */
export function WorkflowCanvas({ ed }: WorkflowCanvasProps) {
  return (
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
          <ConnectionLine key={c.id} connection={c} nodes={ed.workflow.nodes} />
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
        <div className={s.empty}>Drag a node from the palette to start →</div>
      )}
    </div>
  )
}
