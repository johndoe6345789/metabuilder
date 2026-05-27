/**
 * EditorConnectionLayer - SVG layer rendering connections and
 * live drawing preview
 */

'use client';

import React from 'react';
import {
  getBezierPath,
  Position as EdgePosition,
} from '@/lib/flow';
import {
  type NodeType,
  ConnectionLine,
} from '@/../../../components/workflow-editor';
import type { WorkflowNode, WorkflowConnection } from '@metabuilder/hooks';

interface DrawingConnection {
  startNodeId: string;
  startPort: string;
  startPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
}

interface EditorConnectionLayerProps {
  connections: WorkflowConnection[];
  nodes: WorkflowNode[];
  drawingConnection: DrawingConnection | null;
}

export default function EditorConnectionLayer({
  connections,
  nodes,
  drawingConnection: dc,
}: EditorConnectionLayerProps) {
  return (
    <svg
      width="5000"
      height="5000"
      className="canvasSvg"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
      }}
    >
      {connections.map((connection) => (
        <ConnectionLine
          key={connection.id}
          connection={connection}
          nodes={nodes}
        />
      ))}
      {dc &&
        (() => {
          const [path] = getBezierPath({
            sourceX: dc.startPosition.x,
            sourceY: dc.startPosition.y,
            sourcePosition: EdgePosition.Right,
            targetX: dc.currentPosition.x,
            targetY: dc.currentPosition.y,
            targetPosition: EdgePosition.Left,
            curvature: 0.25,
          });
          return (
            <path
              d={path}
              fill="none"
              stroke="var(--mat-sys-primary)"
              strokeWidth={2}
              strokeDasharray="5,5"
              strokeLinecap="round"
            />
          );
        })()}
    </svg>
  );
}
