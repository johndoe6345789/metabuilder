/**
 * EditorCanvasArea - The main canvas drop area with nodes
 */

'use client';

import React from 'react';
import {
  CanvasNode,
  type NodeType,
} from '@/../../../components/workflow-editor';
import styles from '@/../../../scss/atoms/workflow-editor.module.scss';
import EditorConnectionLayer from './EditorConnectionLayer';
import EditorEmptyState from './EditorEmptyState';
import type { EditorCanvasAreaProps } from './editorTypes';

export default function EditorCanvasArea({
  canvasRef,
  canvasOffset,
  zoom,
  isPanning,
  nodes,
  connections,
  drawingConnection,
  selectedNodeId,
  onCanvasDrop,
  onCanvasDragOver,
  onCanvasMouseDown,
  onWheel,
  onNodeSelect,
  onNodeDoubleClick,
  onNodeDragStart,
  onConnectionStart,
  onConnectionEnd,
  getNodeType,
}: EditorCanvasAreaProps) {
  return (
    <div
      ref={canvasRef}
      onDrop={onCanvasDrop}
      onDragOver={onCanvasDragOver}
      onMouseDown={onCanvasMouseDown}
      onWheel={onWheel}
      className={styles.canvasContainer}
      style={{
        backgroundSize:
          `${20 * zoom}px ${20 * zoom}px`,
        backgroundPosition:
          `${canvasOffset.x}px ${canvasOffset.y}px`,
        cursor: isPanning ? 'grabbing' : 'default',
      }}
    >
      <div
        className={styles.canvasTransform}
        style={{
          transform:
            `translate(${canvasOffset.x}px, ` +
            `${canvasOffset.y}px) scale(${zoom})`,
        }}
      >
        <EditorConnectionLayer
          connections={connections}
          nodes={nodes}
          drawingConnection={drawingConnection}
        />

        {nodes.map((node) => (
          <CanvasNode
            key={node.id}
            node={node}
            nodeType={
              getNodeType(node.type) as NodeType | undefined
            }
            isSelected={selectedNodeId === node.id}
            onSelect={onNodeSelect}
            onDoubleClick={onNodeDoubleClick}
            onDragStart={onNodeDragStart}
            onConnectionStart={onConnectionStart}
            onConnectionEnd={onConnectionEnd}
            isDrawingConnection={drawingConnection !== null}
          />
        ))}
      </div>

      {nodes.length === 0 && <EditorEmptyState />}
    </div>
  );
}
