/**
 * CanvasNode Component
 * Renders a workflow node on the canvas with input/output ports
 */

'use client';

import React, { MouseEvent } from 'react';
import type { WorkflowNode, NodeType, Position } from './types';
import { getNodeIcon } from './icons';
import styles from '../../scss/atoms/workflow-editor.module.scss';

export interface CanvasNodeProps {
  node: WorkflowNode;
  nodeType: NodeType | undefined;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDoubleClick: (id: string) => void;
  onDragStart: (e: MouseEvent, nodeId: string) => void;
  onConnectionStart: (nodeId: string, outputName: string, position: Position) => void;
  onConnectionEnd: (nodeId: string, inputName: string) => void;
  isDrawingConnection: boolean;
}

export function CanvasNode({
  node,
  nodeType,
  isSelected,
  onSelect,
  onDoubleClick,
  onDragStart,
  onConnectionStart,
  onConnectionEnd,
  isDrawingConnection,
}: CanvasNodeProps): React.ReactElement {
  const color = nodeType?.color || '#666';

  return (
    <div
      onClick={() => onSelect(node.id)}
      onDoubleClick={() => onDoubleClick(node.id)}
      onMouseDown={(e: MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).classList.contains(styles.outputPort)) return;
        if ((e.target as HTMLElement).classList.contains(styles.inputPort)) return;
        onDragStart(e, node.id);
      }}
      className={`${styles.canvasNode} ${isSelected ? styles.selected : ''}`}
      style={{ left: node.position.x, top: node.position.y }}
    >
      <div className={styles.canvasNodeHeader} style={{ backgroundColor: color }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d={getNodeIcon(nodeType?.icon || 'code')} />
        </svg>
        <h4 className={styles.canvasNodeTitle}>{node.name}</h4>
      </div>

      <div className={styles.canvasNodeBody}>
        <p className={styles.canvasNodeDesc}>{nodeType?.description || 'Custom node'}</p>
      </div>

      {/* Input Ports */}
      {node.inputs.map((input, idx) => (
        <div
          key={`input-${input}`}
          className={styles.inputPort}
          style={{
            top: 80 + idx * 24,
            borderColor: color,
            cursor: isDrawingConnection ? 'crosshair' : 'default',
            transform: isDrawingConnection ? 'scale(1.3)' : 'scale(1)',
            transition: 'transform 0.15s ease',
          }}
          title={`Input: ${input}`}
          onMouseUp={() => {
            if (isDrawingConnection) {
              onConnectionEnd(node.id, input);
            }
          }}
        />
      ))}

      {/* Output Ports */}
      {node.outputs.map((output, idx) => (
        <div
          key={`output-${output}`}
          className={styles.outputPort}
          onMouseDown={(e: MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
            onConnectionStart(node.id, output, {
              x: node.position.x + 200 + 8,
              y: node.position.y + 80 + idx * 24 + 8,
            });
          }}
          style={{ top: 80 + idx * 24, backgroundColor: color, color }}
          title={`Output: ${output}`}
        />
      ))}
    </div>
  );
}
