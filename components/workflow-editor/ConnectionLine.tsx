/**
 * ConnectionLine Component
 * Renders bezier paths between connected nodes
 */

'use client';

import React from 'react';
import { getBezierPath, Position as EdgePosition } from '@/lib/flow';
import type { Connection, WorkflowNode } from './types';

export interface ConnectionLineProps {
  connection: Connection;
  nodes: WorkflowNode[];
}

export function ConnectionLine({ connection, nodes }: ConnectionLineProps): React.ReactElement | null {
  const sourceNode = nodes.find(n => n.id === connection.sourceNodeId);
  const targetNode = nodes.find(n => n.id === connection.targetNodeId);

  if (!sourceNode || !targetNode) return null;

  const sourceOutputIdx = sourceNode.outputs.indexOf(connection.sourceOutput);
  const targetInputIdx = targetNode.inputs.indexOf(connection.targetInput);

  const sourceX = sourceNode.position.x + 200 + 8;
  const sourceY = sourceNode.position.y + 80 + sourceOutputIdx * 24 + 8;
  const targetX = targetNode.position.x - 8;
  const targetY = targetNode.position.y + 80 + targetInputIdx * 24 + 8;

  const [path] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition: EdgePosition.Right,
    targetX,
    targetY,
    targetPosition: EdgePosition.Left,
    curvature: 0.25,
  });

  return (
    <path
      d={path}
      fill="none"
      stroke="var(--mat-sys-outline)"
      strokeWidth={2}
      strokeLinecap="round"
    />
  );
}
